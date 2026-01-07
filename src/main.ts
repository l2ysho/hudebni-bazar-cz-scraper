// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler, createCheerioRouter } from '@crawlee/cheerio';
// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';

interface Input {
    search: string;
    maxRequestsPerCrawl: number;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();
// Structure of input is defined in input_schema.json
const { search = 'fender', maxRequestsPerCrawl = 100 } = (await Actor.getInput<Input>()) ?? ({} as Input);

// `checkAccess` flag ensures the proxy credentials are valid, but the check can take a few hundred milliseconds.
// Disable it for short runs if you are sure your proxy configuration is correct
const proxyConfiguration = await Actor.createProxyConfiguration({ checkAccess: true });

const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, enqueueLinks, log }) => {
    log.info(`Enqueueing details from page: ${request.url}`);

    await enqueueLinks({
        selector: '.str a',
    });

    await enqueueLinks({
        globs: ['**/ID*'],
        label: 'DETAIL',
    });
});

router.addHandler('DETAIL', async ({ request, $, pushData, log }) => {
    const date = /Vloženo (.*?) /.exec($('div.InzeratZarazeno').text())?.[1];

    const location = /Lokalita: (.*?)/.exec($('div.user-udaje').text())?.[1];
    const title = $('h1').text();
    const data = {
        title,
        description: $('div.InzeratText').text(),
        descriptionExtra: null,
        price: $('div.InzeratCena').text(),
        location: location ?? null,
        url: request.url,
        date: date ?? '',
        type: $('div.label-poptavka').length ? 'request' : 'offer',
    };

    log.info(`url: ${request.url} is '${data.title}'`);

    await pushData(data);
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
    useSessionPool: true,
    persistCookiesPerSession: true,
    sessionPoolOptions: {
        maxPoolSize: 1,
        sessionOptions: {
            maxUsageCount: maxRequestsPerCrawl,
        },
    },
});

await crawler.run([`https://hudebnibazar.cz/?f=${search}&kat=0`]);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();

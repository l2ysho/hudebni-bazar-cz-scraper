// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler, createCheerioRouter } from '@crawlee/cheerio';
// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor, KeyValueStore } from 'apify';

interface Input {
    category: string;
    listingType: string;
    county: string;
    search: string;
    maxRequestsPerCrawl: number;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();
// Structure of input is defined in input_schema.json
const {
    category = '',
    listingType = '',
    county = '',
    search = '',
    maxRequestsPerCrawl = 100,
} = (await Actor.getInput<Input>()) ?? ({} as Input);

// `checkAccess` flag ensures the proxy credentials are valid, but the check can take a few hundred milliseconds.
// Disable it for short runs if you are sure your proxy configuration is correct
const proxyConfiguration = await Actor.createProxyConfiguration({ checkAccess: true });

const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, enqueueLinks, log }) => {
    log.info(`Enqueueing details from page: ${request.url}`);

    // Enqueue links to diferent pages (from pagination element).
    await enqueueLinks({
        selector: '.str a',
    });

    // Enqueue links to detail pages.
    await enqueueLinks({
        globs: ['**/ID*'],
        label: 'DETAIL',
    });
});

router.addHandler('DETAIL', async ({ request, $, pushData, log }) => {
    const date = /Vloženo (.*?) /.exec($('div.InzeratZarazeno').text())?.[1];

    const location = /Lokalita: (.*?)/.exec($('div.user-udaje').text())?.[1];
    const title = $('h1').text();

    // Extract image URL from the detail page
    const imageElement = $('div.InzeratObrM a.fancybox');
    const imageUrl = imageElement.attr('href');
    let imageKey = null;

    // Download and store image in key-value store if it exists
    if (imageUrl) {
        try {
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://hudebnibazar.cz${imageUrl}`;
            const response = await fetch(fullImageUrl);

            if (response.ok) {
                const imageBuffer = Buffer.from(await response.arrayBuffer());
                // Create a unique key from the listing ID or image filename
                const listingId = request.url.match(/ID(\d+)/)?.[1] || Date.now();
                const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
                log.info(`extension: ${extension}`);

                imageKey = `image-${listingId}.${extension}`;

                // Store image in key-value store
                await Actor.setValue(imageKey, imageBuffer, { contentType: `image/${extension}` });
                log.info(`Stored image: ${imageKey}`);
            } else {
                log.warning(`Image download failed with HTTP status ${response.status}: ${fullImageUrl}`);
            }
        } catch (error) {
            log.warning(`Failed to download image from ${imageUrl}: ${error}`);
            throw error;
        }
    }

    let publicUrl = null;

    if (imageKey) {
        const store = await KeyValueStore.open();
        publicUrl = store.getPublicUrl(imageKey);
    }

    const data = {
        title,
        description: $('div.InzeratText').text(),
        descriptionExtra: null,
        price: $('div.InzeratCena').text(),
        location: location ?? null,
        url: request.url,
        date: date ?? '',
        type: $('div.label-poptavka').length ? 'request' : 'offer',
        imageUrl: publicUrl,
        imageKey,
    };

    log.info(`url: ${request.url} is '${data.title}'`);

    await pushData(data);
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
    // As hudebnibazar.cz store query params in cookie rather than URL, we need to persist cookies per session
    persistCookiesPerSession: true,
    sessionPoolOptions: {
        // set pool size to 1 to ensure all requests are made with the same session
        maxPoolSize: 1,
        sessionOptions: {
            // as default maxUsageCount is 50, we need to ensure it is the same as our maxRequestsPerCrawl
            maxUsageCount: maxRequestsPerCrawl,
        },
    },
});

// Build URL with optional query parameters
const params = new URLSearchParams({
    f: search,
    kat: '0',
});

if (listingType) {
    params.set('n', listingType);
}

if (county) {
    params.set('r', county);
}

const url = `https://hudebnibazar.cz/${category}?${params.toString()}`;
await crawler.run([url]);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();

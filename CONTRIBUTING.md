
## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 16 or higher
- [Apify CLI](https://docs.apify.com/cli/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hudebni-bazar-cz-scraper

# Install dependencies
npm install

# Run locally
apify run
```

### Testing

Create a test input in `.actor/INPUT.json`:

```json
{
  "search": "fender",
  "maxRequestsPerCrawl": 10
}
```

Then run:

```bash
apify run
```

## Deploy to Apify

### Option 1: Link Git Repository

1. Go to [Actor creation page](https://console.apify.com/actors/new)
2. Click on **Link Git Repository**
3. Connect your repository

### Option 2: Push from Local Machine

```bash
# Login to Apify
apify login

# Deploy the actor
apify push
```

## Resources

- [Apify SDK Documentation](https://docs.apify.com/sdk/js)
- [Crawlee Documentation](https://crawlee.dev/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [Web Scraping Tutorial](https://docs.apify.com/academy/web-scraping-for-beginners)
- [Apify Platform Documentation](https://docs.apify.com/platform)
- [Join our Discord community](https://discord.com/invite/jyEM2PRvMU)

## Support

For bugs or feature requests, please [open an issue](https://github.com/your-username/hudebni-bazar-cz-scraper/issues).

## License

This project is licensed under the Apache-2.0 License.

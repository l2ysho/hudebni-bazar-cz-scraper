# Hudební Bazar Scraper

Scrape musical instrument listings from [hudebnibazar.cz](https://hudebnibazar.cz) with advanced filtering options. Extract listing details including title, description, price, location, and automatically download high-resolution images.

## Features

- **Flexible Filtering** - Search by category, listing type (sell/buy), region, and keywords
- **Complete Data Extraction** - Title, description, price, location, date, and listing type
- **Image Download** - Automatically downloads and stores high-resolution images in Apify key-value store
- **Public Image URLs** - Get permanent public URLs for all images
- **Pagination Support** - Automatically crawls through all result pages
- **Proxy Support** - Built-in proxy rotation to prevent blocking

## Input

The actor accepts the following input parameters:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `category` | String | Category to scrape (guitars, drums, keyboards, etc.) | No |
| `listingType` | String | Filter by listing type: `nabidka` (sell), `poptavka` (buy), `ruzne` (various) | No |
| `county` | String | Filter by Czech region (1-14) or Slovakia (15) | No |
| `search` | String | Search keyword (e.g., "fender", "yamaha") | No |
| `maxRequestsPerCrawl` | Integer | Maximum number of pages to crawl | No (default: 100) |

### Available Categories

- Baskytary (Bass guitars)
- Bicí nástroje (Drums)
- Dřevěné dechové nástroje (Woodwind instruments)
- Hudebníci a skupiny (Musicians and bands)
- Klávesové nástroje (Keyboards)
- Kytary (Guitars)
- Lekce a učitelé (Lessons and teachers)
- Ostatní kolem hudby (Other music-related)
- Smyčcové nástroje (String instruments)
- Studiová technika (Studio equipment)
- Světelné aparatury (Lighting equipment)

### Example Input

```json
{
  "category": "kytary/110000/",
  "listingType": "nabidka",
  "county": "1",
  "search": "fender",
  "maxRequestsPerCrawl": 50
}
```

## Output

The actor stores results in the dataset with the following structure:

```json
{
  "title": "Fender Stratocaster American Standard",
  "description": "Prodám kytaru Fender Stratocaster...",
  "descriptionExtra": null,
  "price": "25 000 Kč",
  "location": "Praha",
  "url": "https://hudebnibazar.cz/inzerat/ID123456",
  "date": "01.01.2024",
  "type": "offer",
  "imageUrl": "https://api.apify.com/v2/key-value-stores/.../image-123456.jpg",
  "imageKey": "image-123456.jpg"
}
```

### Output Fields

- `title` - Listing title
- `description` - Main description text
- `descriptionExtra` - Additional description (currently null)
- `price` - Listed price with currency
- `location` - City or region where the item is located
- `url` - Direct URL to the listing
- `date` - Date when the listing was posted
- `type` - Either "offer" (prodám) or "request" (koupím)
- `imageUrl` - Public URL to the downloaded high-resolution image
- `imageKey` - Key-value store key for the image

## How It Works

1. The scraper builds a search URL based on your filter criteria
2. Crawls the listing pages and extracts links to individual listings
3. Follows pagination to discover all matching results
4. For each listing, extracts detailed information
5. Downloads the main high-resolution image to Apify key-value store
6. Generates a permanent public URL for each image
7. Stores all data in the dataset

## Use Cases

- **Price Monitoring** - Track prices of specific instruments over time
- **Market Research** - Analyze the used musical instrument market
- **Deal Alerts** - Find the best deals on specific brands or models
- **Inventory Building** - Build a database of available instruments
- **Regional Analysis** - Compare prices across different regions

## Performance

- Uses session pooling for efficient crawling
- Proxy rotation to avoid blocking
- Cheerio-based scraping for fast performance
- Typical run time: 1-5 minutes depending on result count

## Integration

This actor can be integrated with:
- [Zapier](https://apify.com/integrations/zapier)
- [Make](https://apify.com/integrations/make)
- [Google Sheets](https://apify.com/integrations/google-sheets)
- Any service via [Apify API](https://docs.apify.com/api/v2)

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

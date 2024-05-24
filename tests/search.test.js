const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver');

const TIMEOUT = 50000;

describe('Search and Filter Products on Waterstones Website', () => {
    let driver;

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();

        await driver.get("https://www.waterstones.com/");
        await acceptCookies(driver);
    });

    afterAll(async () => {
        await driver.quit();
    });

    test('Test Open Web Page', async () => {
        const pageTitle = await driver.getTitle();
        expect(pageTitle).toContain("Waterstones");
    });

    test('Test Search for keyword “harry potter”', async () => {
        const searchField = await driver.findElement(By.css(".input-search"));
        await searchField.click();
        await searchField.sendKeys("harry potter", Key.RETURN);

        // Wait for search results to load
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify more than 1 product found
        const searchCountText = await driver.findElement(By.className("search-result-tab-all")).getText();
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);

        // Verify products contain searched keyword
        const productTitles = await driver.findElements(By.css(".title-wrap h3"));
        const productTitlesText = await Promise.all(productTitles.map(title => title.getText()));
        expect(productTitlesText.every(title => title.toLowerCase().includes("harry potter"))).toBe(true);
    });

    test('Test Sort searched items by price', async () => {
        // Select price sort option
        const sortDropdown = await driver.findElement(By.css(".sort-dropdown"));
        await sortDropdown.click();

        const priceSortOption = await driver.findElement(By.xpath("//li[contains(text(), 'Price - Low to High')]"));
        await priceSortOption.click();

        // Wait for search results to reload
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify products are sorted by price
        const productPrices = await driver.findElements(By.css(".book-price"));
        const sortedPrices = await Promise.all(productPrices.map(price => price.getText().then(text => parseFloat(text.replace('£', '')))));
        expect(sortedPrices).toEqual(sortedPrices.slice().sort((a, b) => a - b));
    });

    test('Test Filter products by Format, select filter as “Hardback”', async () => {
        // Apply Format filter
        const formatFilter = await driver.findElement(By.xpath("//label[contains(text(), 'Format')]/following-sibling::div//input[@type='checkbox' and @value='Hardback']"));
        await formatFilter.click();

        // Wait for search results to reload
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify fewer products are displayed after filtering by Hardback format
        const productItems = await driver.findElements(By.css(".product-cell"));
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify items selected have correct format
        const productFormats = await Promise.all(productItems.map(item => item.findElement(By.css(".format-type")).getText()));
        expect(productFormats.every(format => format.toLowerCase().includes("hardback"))).toBe(true);
    });
});

async function acceptCookies(driver) {
    try {
        await driver.wait(until.elementLocated(By.id("onetrust-accept-btn-handler")), TIMEOUT);
        const cookieButton = await driver.findElement(By.id("onetrust-accept-btn-handler"));
        await cookieButton.click();
    } catch (error) {
        console.error("Failed to accept cookies:", error);
    }
}
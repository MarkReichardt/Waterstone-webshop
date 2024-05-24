const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver');

const TIMEOUT = 50000;

const getDriver = async () => {
    const driver = await new Builder().forBrowser('chrome').build();
    driver.manage().window().maximize();
    driver.manage().setTimeouts({implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT});
    return driver;
};

const findElement = async (driver, selector) => {
    return await driver.findElement(By.css(selector));
};

const findElements = async (driver, selector) => {
    return await driver.findElements(By.css(selector));
};

const getText = async (element) => {
    return await element.getText();
};

const clickElement = async (element) => {
    await element.click();
};

describe('Search and Filter Products on Waterstones Website', () => {
    let driver;

    beforeAll(async () => {
        driver = await getDriver();
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
        const searchField = await findElement(driver, ".input-search");
        await clickElement(searchField);
        await searchField.sendKeys("harry potter", Key.RETURN);

        // Wait for search results to load
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify more than 1 product found
        const searchCountText = await getText(await findElement(driver, ".search-result-tab-all"));
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);

        // Verify products contain searched keyword
        const productTitles = await findElements(driver, ".title-wrap h3");
        const productTitlesText = await Promise.all(productTitles.map(title => getText(title)));
        expect(productTitlesText.every(title => title.toLowerCase().includes("harry potter"))).toBe(true);
    });

    test('Test Sort searched items by price', async () => {
        // Select price sort option
        const sortDropdown = await findElement(driver, ".sort-dropdown");
        await clickElement(sortDropdown);

        const priceSortOption = await driver.findElement(By.xpath("//li[contains(text(), 'Price - Low to High')]"));
        await clickElement(priceSortOption);

        // Wait for search results to reload
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify products are sorted by price
        const productPrices = await findElements(driver, ".book-price");
        const sortedPrices = await Promise.all(productPrices.map(price => getText(price).then(text => parseFloat(text.replace('£', '')))));
        expect(sortedPrices).toEqual(sortedPrices.slice().sort((a, b) => a - b));
    });

    test('Test Filter products by Format, select filter as “Hardback”', async () => {
        // Apply Format filter
        const formatFilter = await driver.findElement(By.xpath("//label[contains(text(), 'Format')]/following-sibling::div//input[@type='checkbox' and @value='Hardback']"));
        await clickElement(formatFilter);

        // Wait for search results to reload
        await driver.wait(until.elementLocated(By.className("search-result-tab-all")), TIMEOUT);

        // Verify fewer products are displayed after filtering by Hardback format
        const productItems = await findElements(driver, ".product-cell");
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify items selected have correct format
        const productFormats = await Promise.all(productItems.map(item => getText(item.findElement(By.css(".format-type")))));
        expect(productFormats.every(format => format.toLowerCase().includes("hardback"))).toBe(true);
    });
});

async function acceptCookies(driver) {
    try {
        await driver.wait(until.elementLocated(By.id("onetrust-accept-btn-handler")), TIMEOUT);
        const cookieButton = await findElement(driver, "#onetrust-accept-btn-handler");
        await clickElement(cookieButton);
    } catch (error) {
        console.error("Failed to accept cookies:", error);
    }
}
const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver');

const TIMEOUT = 50000;

describe('Navigate Waterstones Website', () => {
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

    test('Test Scroll down to "Bestsellers" option', async () => {
        const bestsellersSection = await driver.findElement(By.css("#Bestsellers"));
        await driver.executeScript("arguments[0].scrollIntoView();", bestsellersSection);

        const isBestsellersVisible = await bestsellersSection.isDisplayed();
        expect(isBestsellersVisible).toBe(true);
    });

    test('Test Click on “See More” button', async () => {
        const seeMoreButton = await driver.findElement(By.css(".see-more a"));
        await seeMoreButton.click();

        // Wait for the Bestselling Books page to load
        await driver.wait(until.urlContains("/bestsellers"), TIMEOUT);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain("/bestsellers");
    });

    test('Test Click on “Business, Finance & Law” filter', async () => {
        const businessFinanceLawFilter = await driver.findElement(By.linkText("Business, Finance & Law"));
        await businessFinanceLawFilter.click();

        // Wait for the filter to be applied
        await driver.wait(until.urlContains("/business-finance-law"), TIMEOUT);

        const appliedFilter = await driver.findElement(By.css(".breadcrumb-current"));
        expect(await appliedFilter.getText()).toContain("Business, Finance & Law");

        // Verify more than 1 product found
        const searchCountText = await driver.findElement(By.className("search-result-tab-all")).getText();
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
    });

    test('Test Click on “Accounting” subfilter', async () => {
        const accountingSubfilter = await driver.findElement(By.linkText("Accounting"));
        await accountingSubfilter.click();

        // Wait for the subfilter to be applied
        await driver.wait(until.urlContains("/accounting"), TIMEOUT);

        const appliedFilter = await driver.findElement(By.css(".breadcrumb-current"));
        expect(await appliedFilter.getText()).toContain("Accounting");

        // Verify fewer products are displayed after filtering
        const productItems = await driver.findElements(By.css(".product-cell"));
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify more than 1 product found
        const searchCountText = await driver.findElement(By.className("search-result-tab-all")).getText();
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
    });

    test('Test Click on “Cost accounting” subfilter', async () => {
        const costAccountingSubfilter = await driver.findElement(By.linkText("Cost Accounting"));
        await costAccountingSubfilter.click();

        // Wait for the subfilter to be applied
        await driver.wait(until.urlContains("/cost-accounting"), TIMEOUT);

        const appliedFilter = await driver.findElement(By.css(".breadcrumb-current"));
        expect(await appliedFilter.getText()).toContain("Cost Accounting");

        // Verify fewer products are displayed after filtering
        const productItems = await driver.findElements(By.css(".product-cell"));
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify more than 1 product found
        const searchCountText = await driver.findElement(By.className("search-result-tab-all")).getText();
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
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
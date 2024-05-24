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

describe('Navigate Waterstones Website', () => {
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

    test('Test Scroll down to "Bestsellers" option', async () => {
        const bestsellersSection = await findElement(driver, "#Bestsellers");
        await driver.executeScript("arguments[0].scrollIntoView();", bestsellersSection);

        const isBestsellersVisible = await bestsellersSection.isDisplayed();
        expect(isBestsellersVisible).toBe(true);
    });

    test('Test Click on “See More” button', async () => {
        const seeMoreButton = await findElement(driver, ".see-more a");
        await clickElement(seeMoreButton);

        // Wait for the Bestselling Books page to load
        await driver.wait(until.urlContains("/bestsellers"), TIMEOUT);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain("/bestsellers");
    });

    test('Test Click on “Business, Finance & Law” filter', async () => {
        const businessFinanceLawFilter = await findElement(driver, By.linkText("Business, Finance & Law"));
        await clickElement(businessFinanceLawFilter);

        // Wait for the filter to be applied
        await driver.wait(until.urlContains("/business-finance-law"), TIMEOUT);

        const appliedFilter = await findElement(driver, ".breadcrumb-current");
        expect(await getText(appliedFilter)).toContain("Business, Finance & Law");

        // Verify more than 1 product found
        const searchCountText = await getText(await findElement(driver, By.className("search-result-tab-all")));
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
    });

    test('Test Click on “Accounting” subfilter', async () => {
        const accountingSubfilter = await findElement(driver, By.linkText("Accounting"));
        await clickElement(accountingSubfilter);

        // Wait for the subfilter to be applied
        await driver.wait(until.urlContains("/accounting"), TIMEOUT);

        const appliedFilter = await findElement(driver, ".breadcrumb-current");
        expect(await getText(appliedFilter)).toContain("Accounting");

        // Verify fewer products are displayed after filtering
        const productItems = await findElements(driver, ".product-cell");
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify more than 1 product found
        const searchCountText = await getText(await findElement(driver, By.className("search-result-tab-all")));
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
    });

    test('Test Click on “Cost accounting” subfilter', async () => {
        const costAccountingSubfilter = await findElement(driver, By.linkText("Cost Accounting"));
        await clickElement(costAccountingSubfilter);

        // Wait for the subfilter to be applied
        await driver.wait(until.urlContains("/cost-accounting"), TIMEOUT);

        const appliedFilter = await findElement(driver, ".breadcrumb-current");
        expect(await getText(appliedFilter)).toContain("Cost Accounting");

        // Verify fewer products are displayed after filtering
        const productItems = await findElements(driver, ".product-cell");
        expect(productItems.length).toBeLessThan(10); // Assuming less than 10 products for demo

        // Verify more than 1 product found
        const searchCountText = await getText(await findElement(driver, By.className("search-result-tab-all")));
        const searchCountNum = parseInt(searchCountText.match(/\d+/)[0]);
        expect(searchCountNum).toBeGreaterThan(1);
    });
});

async function acceptCookies(driver) {
    try {
        const cookieButton = await findElement(driver, By.id("onetrust-accept-btn-handler"));
        await clickElement(cookieButton);
    } catch (error) {
        console.error("Failed to accept cookies:", error);
    }
}
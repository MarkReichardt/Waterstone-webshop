const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
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

describe('Add products to shopping cart', () => {
    let driver;

    beforeAll(async () => {
        driver = await getDriver();
        await driver.get("https://www.waterstones.com/");
        driver.sleep(15000);
        const cookieButton = await findElement(driver, "#onetrust-button-group > #onetrust-accept-btn-handler");
        await clickElement(cookieButton);
    });
      
    afterAll(async() => {
        await driver.quit();
    });
    
    test('Test Open Web Page', async () => {
        const pageTitle = await getText(await findElement(driver, "#main-logos > div > a.logo"));
        expect(pageTitle).toBe("Waterstones");
    });

    test('Test Search for any product keyword', async () => {
        const searchField = await findElement(driver, ".input.input-search");
        await clickElement(searchField);
        searchField.sendKeys("dune");
        await clickElement(await findElement(driver, ".input-search-button.icon"));

        const searchCount = await getText(await findElement(driver, ".search-result-tab-all"));
        const searchCountNum = searchCount.replaceAll(/\D+/g,"");
        expect(parseInt(searchCountNum)).toBeGreaterThan(1);
    });

    test('Test adding first item to shopping cart', async () => {
        const imageElem = await findElements(driver, "div.book-thumb > div > a > img");
        const actions = driver.actions({async: true});
        await actions.move({origin: imageElem[0]}).perform();

        const basketElem = await findElements(driver, ".button-buy.button.button-teal.button-small");
        expect((await getText(basketElem[0])).toLowerCase()).toContain("Add to Basket".toLowerCase());

        await clickElement(basketElem[0]);
        
        const cartCount = await findElement(driver, "a.basket > strong");
        driver.wait(until.elementTextIs(cartCount, "1"), 5000);
    });

    test('Test adding second item to shopping cart', async () => {
        const imageElem = await findElements(driver, "div.book-thumb > div > a > img");
        const actions = driver.actions({async: true});
        await actions.move({origin: imageElem[1]}).perform();

        const basketElem = await findElements(driver, ".button-buy.button.button-teal.button-small");
        expect((await getText(basketElem[1])).toLowerCase()).toContain("Add to Basket".toLowerCase());

        await clickElement(basketElem[1]);
       
        const cartCount = await findElement(driver, "a.basket > strong");
        driver.wait(until.elementTextIs(cartCount, "2"), 5000);        
    });

    test('Test shopping cart has two correct items', async () => {
        await clickElement(await findElement(driver, "a.basket > strong"));

        const itemPrices = await findElements(driver, ".lblTotalItem.lblTotalItemCost");
        const firstPrice = parseFloat((await getText(itemPrices[0])).replace(/£/g, ""));
        const secondPrice = parseFloat((await getText(itemPrices[1])).replace(/£/g, ""));
        
        const basketSum = await getText(await findElement(driver, "body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div.row.panel-total-to-pay > div.large-11.columns.large-padding-top-8.large-border-dotted-top.large-padding-left-0 > div > p > span"));
        const basketSumNum = parseFloat(basketSum.replace(/£/g,""));

        expect(basketSumNum).toBe(firstPrice + secondPrice);
    });

    test('Test remove first product from the cart', async () => {
        await clickElement(await findElement(driver, "body > div.row.chk-surround.large-min-height > div.small-24.chk-left.medium-24.large-18.columns.main-container > div.panel-basket.panel-content-basket > div > ul > li:nth-child(1) > div > div.panel-basket-item > div.small-19.medium-12.columns.medium-margin-left-4.small-padding-left-0.small-padding-right-0 > ul > li:nth-child(2) > a"));

        const getBasketCount = await findElement(driver, "body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div:nth-child(2) > div > p > a > span.lblBasketQuantity");
        driver.wait(until.elementTextIs(getBasketCount, "1"), 5000);

        const itemPrices = await findElements(driver, ".lblTotalItem.lblTotalItemCost");
        const firstPrice = (await getText(itemPrices[0])).replace(/£/g, "");
        
        const basketSum = await findElement(driver, "body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div.row.panel-total-to-pay > div.large-11.columns.large-padding-top-8.large-border-dotted-top.large-padding-left-0 > div > p > span");
        driver.wait(until.elementTextIs(basketSum, firstPrice), 5000);
    });
});
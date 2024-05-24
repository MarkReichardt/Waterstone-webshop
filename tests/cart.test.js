const { Builder, By, Key, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
require('chromedriver')

const TIMEOUT = 50000;

describe('Add products to shopping cart', () => {

    let driver;

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        driver.manage().window().maximize();
        driver.manage().setTimeouts({implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT});

        await driver.get("https://www.waterstones.com/");
        driver.sleep(15000);
        let cookieButton = await driver.findElement(By.css("#onetrust-button-group > #onetrust-accept-btn-handler")); 
        cookieButton.click();
    });
      
    afterAll(async() => {
        await driver.quit();
    });
    
    test('Test Open Web Page', async () => {
        //Verify that the web page has a Waterstones title.
        let pageTitle = await driver.findElement(By.css("#main-logos > div > a.logo")).getText();
        expect(pageTitle).toBe("Waterstones");
    })

    test('Test Search for any product keyword', async () => {
        //Search for any product keyword
        let searchField = await driver.findElement(By.className("input input-search"));
        searchField.click();
        searchField.sendKeys("dune");
        //searchField.sendKeys(Key.ENTER);
        await driver.findElement(By.className("input-search-button icon")).click();

        //Verify that there are more than 1 products found.
        const searchCount = await driver.findElement(By.className("search-result-tab-all")).getText();
        const searchCountNum = searchCount.replaceAll(/\D+/g,"");
        expect(parseInt(searchCountNum)).toBeGreaterThan(1);
    })

    test('Test adding first item to shopping cart', async () => {
        //Verify that products can be added to cart.
        const imageElem = await driver.findElements(By.css("div.book-thumb > div > a > img"));
        //try to hover
        const actions = driver.actions({async: true});
        await actions.move({origin: imageElem[0]}).perform();

        let basketElem = await driver.findElements(By.className("button-buy button button-teal button-small"));
        expect((await basketElem[0].getText()).toLowerCase()).toContain("Add to Basket".toLowerCase());

        //Add 1 item to cart.
        await basketElem[0].click();
        
        //Verify that shopping cart now has 1 item added.
        let cartCount = await driver.findElement(By.css("a.basket > strong"));
        driver.wait(until.elementTextIs(cartCount, "1"), 5000);
    })

    test('Test adding second item to shopping cart', async () => {
        //Verify that products can be added to cart.
        const imageElem = await driver.findElements(By.css("div.book-thumb > div > a > img"));
        //try to hover
        const actions = driver.actions({async: true});
        await actions.move({origin: imageElem[1]}).perform();

        let basketElem = await driver.findElements(By.className("button-buy button button-teal button-small"));
        expect((await basketElem[1].getText()).toLowerCase()).toContain("Add to Basket".toLowerCase());

        //Add 1 item to cart.
        await basketElem[1].click();
       
        //Verify that shopping cart now has 2 items added.
        let cartCount = await driver.findElement(By.css("a.basket > strong"));
        driver.wait(until.elementTextIs(cartCount, "2"), 5000);        
    })

    test('Test shopping cart has two correct items', async () => {
        await driver.findElement(By.css("a.basket > strong")).click();
        //Verify that cart sum is correct.
        let itemPrices = await driver.findElements(By.className("lblTotalItem lblTotalItemCost"));
        let firstPrice = parseFloat((await itemPrices[0].getText()).replace(/£/g, ""));
        let secondPrice = parseFloat((await itemPrices[1].getText()).replace(/£/g, ""));
        
        let basketSum = await driver.findElement(By.css("body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div.row.panel-total-to-pay > div.large-11.columns.large-padding-top-8.large-border-dotted-top.large-padding-left-0 > div > p > span")).getText();
        const basketSumNum = parseFloat(basketSum.replace(/£/g,""))

        expect(basketSumNum).toBe(firstPrice + secondPrice);

        //Verify that cart has correct items added.
    })

    test('Test remove first product from the cart', async () => {
        //Remove first product from the cart
        await driver.findElement(By.css("body > div.row.chk-surround.large-min-height > div.small-24.chk-left.medium-24.large-18.columns.main-container > div.panel-basket.panel-content-basket > div > ul > li:nth-child(1) > div > div.panel-basket-item > div.small-19.medium-12.columns.medium-margin-left-4.small-padding-left-0.small-padding-right-0 > ul > li:nth-child(2) > a")).click();

        //Verify that cart has 1 item.
        let getBasketCount = await driver.findElement(By.css("body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div:nth-child(2) > div > p > a > span.lblBasketQuantity"));
        driver.wait(until.elementTextIs(getBasketCount, "1"), 5000);

        //Verify that cart sum is correct.
        let itemPrices = await driver.findElements(By.className("lblTotalItem lblTotalItemCost"));
        let firstPrice = (await itemPrices[0].getText()).replace(/£/g, "");
        
        let basketSum = await driver.findElement(By.css("body > div.row.chk-surround.large-min-height > div.large-6.chk-right.columns.show-for-large > div > div > div.float-left.position-relative.full-width.large-margin-top-24 > div > div.row.panel-total-to-pay > div.large-11.columns.large-padding-top-8.large-border-dotted-top.large-padding-left-0 > div > p > span"));
        driver.wait(until.elementTextIs(basketSum, firstPrice), 5000);

        //Verify that cart has correct items added.
    })
})
require('dotenv').config();

const fs = require('fs');
const { chromium } = require('playwright');

const password = process.env.PASSWORD;
const email = process.env.EMAIL;

(async () =>{
    const browser = await chromium.launch({ 
        headless: false,                   // for test
        args: ['--proxy-server=direct://'] // to disable vpn
    });
    const page = await browser.newPage();

    await page.goto('https://codingprojects.ru/login');

    await page.fill('input[id="inputEmail"]', email);
    await page.fill('input[id="inputPassword"]', password);
    await page.getByRole('button', { name: 'Войти' }).click();

    const cookies = await page.context().cookies();

    await page.waitForTimeout(1000);

    await browser.close();

    const jsonString = JSON.stringify(cookies, null, 2);

    try {
        fs.writeFileSync('cookies.json', jsonString, 'utf8');
    } catch (err) {
        console.error('Error while creating cookies json: ', err);
    }
})();
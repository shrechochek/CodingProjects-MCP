const fs = require('fs');
const { chromium } = require('playwright');

(async () => {    
    const browser = await chromium.launch({ 
        headless: false,                   // for test
        args: ['--proxy-server=direct://'] // to disable vpn
    });
    const context = await browser.newContext();

    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf-8'));
    await context.addCookies(cookies);

    const page = await context.newPage();
  
    await page.goto('https://codingprojects.ru/insider/courses/153'); // 153 just for testing later it must accept a custom course id

    const chapters = await page.locator('.course-chapter-switcher__item').evaluateAll(elements => 
        elements.map(el => ({
            name: el.querySelector('.course-chapter-switcher__item-name')?.innerText.trim(),
            percent: el.querySelector('.course-chapter-switcher__item-percent')?.innerText.trim(),
            link: el.href
        }))
    );

    console.log(chapters);

    await browser.close()

    const jsonString = JSON.stringify(chapters, null, 2);

    try {
        fs.writeFileSync('chapters.json', jsonString, 'utf8');
    } catch (err) {
        console.error('Error while creating cookies json: ', err);
    }
})();

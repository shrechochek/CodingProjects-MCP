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
  
    await page.goto('https://codingprojects.ru/insider/courses');

    const coursesData = await page.locator('a[class*="course-index"]').evaluateAll(elements => 
        elements.map(el => ({
            title: el.innerText.trim(),
            link: el.href
        }))
    );

    await browser.close()

    const jsonString = JSON.stringify(coursesData, null, 2);

    try {
        fs.writeFileSync('courses.json', jsonString, 'utf8');
    } catch (err) {
        console.error('Error while creating cookies json: ', err);
    }
})();

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
  
    await page.goto('https://school.mos.ru/diary/homeworks/homeworks');
    try {
        await page.locator('p[class*="-time"]').waitFor({ state: 'visible' });
    } catch (e) {
        console.log("Content loading Error: ", e);
    }

    const fullText = await page.content();

    await browser.close();

    const dates = [];
    const dates_indices = [];

    const dateRegex = /dateAndCountOfHm[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(fullText)) !== null) {
        const cleanDate = dateMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();

        dates.push(cleanDate);
        dates_indices.push(dateMatch.index);
    }

    const homeworks_dates = [];
    const homeworks_links = [];
    const homeowrks_texts = [];

    let curr_index = fullText.indexOf("/diary/homeworks/homeworks/");

    while (curr_index != -1) {
        const curr_homework_index = fullText.indexOf(">",fullText.indexOf("<p", curr_index+1));
        const curr_close_homework_index = fullText.indexOf("</p>", curr_homework_index);
        homeowrks_texts.push(fullText.slice(curr_homework_index+1, curr_close_homework_index));

        const curr_close_index = fullText.indexOf('"', curr_index+1);
        homeworks_links.push(fullText.slice(curr_index+27,curr_close_index-"_normal".length));
        curr_index = fullText.indexOf("/diary/homeworks/homeworks", curr_index+1);
    }

    const homeworks_names = [];

    let searchIndex = 0;
    while (true) {
        let startTagIndex = fullText.indexOf('<h6', searchIndex);
        if (startTagIndex === -1) break;

        let contentStartIndex = fullText.indexOf('>', startTagIndex) + 1;
        let contentEndIndex = fullText.indexOf('</h6>', contentStartIndex);
        if (contentEndIndex === -1) break;

        let currentDate = '';
        for (let i = 0; i < dates_indices.length; i++) {
            if (contentStartIndex > dates_indices[i]) {
                currentDate = dates[i];
            } else {
                break;
            }
        }
        homeworks_dates.push(currentDate);

        homeworks_names.push(fullText.slice(contentStartIndex, contentEndIndex));
        searchIndex = contentEndIndex + 5;
    }

    const homeworks = [];

    for (let i = 0; i < homeworks_links.length; i++) {
        homeworks.push({"id": homeworks_links[i], "title": homeowrks_texts[i], "subject": homeworks_names[i], "date": homeworks_dates[i]});
    }

    // console.log(dates);
    // console.log(dates_indices);
    
    fs.writeFileSync('homeworks-list.json', JSON.stringify(homeworks, null, 2), 'utf8');
})();

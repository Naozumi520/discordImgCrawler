const puppeteer = require('puppeteer');
const path = require('path');
const download = require('./download');
const headless_mode = process.argv[2]
const fs = require('fs');
const conf_file = "./config.json";
const rawdata = fs.readFileSync(conf_file);
const config = JSON.parse(rawdata);


const main = async () => {
    const browser = await puppeteer.launch({
        //executablePath: './chrome-win/chrome.exe',
        headless: (headless_mode !== 'true') ? false : true,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        slowMo: 0,
    });
    const pages = await browser.pages();
    const page = pages[0];
    page.setUserAgent('Chrome');
    await page.goto('https://discord.com/channels/' + config.serverID + '/' + config.channelID + '/0', { waitUntil: 'networkidle0' });
    let target = 0;
    let downloaded = 0;
    page.on("request", async req => {
        if (req.url().startsWith('https://media.discordapp.net/attachments/') && req.resourceType() === 'image') { //https://media.discordapp.net/attachments/123456789012345678/876543210987654321/IMG_7448.jpg?width=1018&height=1357
            const imageUrl = req.url().split(/\?format=|\?width=/g)[0];
            const imageName = path.win32.basename(imageUrl);
            download(imageUrl, `./spider/${imageName}`, function (state) {
                target++;
                console.log(`Image downloading: ${imageUrl}`);
                if (config.showDownloadDetails) console.log("progress", state);
            }, function (response) {
                if (response.statusCode !== 200) console.log("status code", response.statusCode);
            }, function (error) {
                console.log("error", error);
            }, function () {
                downloaded++;
                console.log(`Image saved: ${imageName} (${downloaded}/${target})`);
            });
        }
    });
    const scrollable_section = '#app-mount > div.app-3xd6d0 > div > div.layers-OrUESM.layers-1YQhyW > div > div > div > div > div.chat-2ZfjoI > div.content-1jQy2l > main > div.messagesWrapper-RpOMA3.group-spacing-16 > div';
    await page.waitForSelector(scrollable_section, { timeout: 0 });
    const interval = setInterval(async () => {
        const scrolling = await page.evaluate(selector => {
            const scrollableSection = document.querySelector(selector);
            scrollableSection.scrollTop += 1000;
            if (scrollableSection.scrollTop = scrollableSection.scrollHeight) {
                return 'finished';
            };
        }, scrollable_section);
        /*
        if (scrolling === 'finished' && downloaded === target) { //To-do: fix finished is sent but not finished
            clearInterval(interval);
            return console.log('Done: All images has been saved.');
        }
        */
    }, 500);
}

main();

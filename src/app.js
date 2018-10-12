const express = require('express');
const http = require('http');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iphoneX = devices['iPhone X'];

// const window_w = 1920;
// const window_h = 1360;  // toolbar height: 80
const window_w = 2560;
const window_h = 1440;
let browser;
const urls_a = [
    'http://localhost:8080/ddc/a-1',
    'http://localhost:8080/ddc/a-2',
    'http://localhost:8080/ddc/a-3',
    'http://localhost:8080/ddc/a-4'
];
const urls_b = [
    'http://localhost:8080/ddc/b-1',
    'http://localhost:8080/ddc/b-2',
    'http://localhost:8080/ddc/b-3',
    'http://localhost:8080/ddc/b-4'
];
const urls_c = [
    'http://localhost:8080/ddc/c-1',
    'http://localhost:8080/ddc/c-2',
    'http://localhost:8080/ddc/c-3',
    'http://localhost:8080/ddc/c-4'
];
const urls_d = [
    'http://localhost:8080/ddc/d-1',
    'http://localhost:8080/ddc/d-2',
    'http://localhost:8080/ddc/d-3',
    'http://localhost:8080/ddc/d-4'
];

const urls = [
    'https://apple.com',
    'https://youtube.com',
    'https://google.com',
    'https://facebook.com'
];


const PORT = 8080;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

async function keepOneTab() {
    let pages = await browser.pages();
    if (pages.length>1) {
        for (let index = 1; index < pages.length; index++) {
            const element = pages[index];
            await element.close();
        }
    }
}

async function openTab(url) {
    const page = await browser.newPage();
    await page.setViewport({ width: window_w, height: window_h });
    await page.goto(url);
}

try {
    (async () => {
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            // args: ['--window-position=0,0','--disable-infobars', `--window-size=${window_w},${window_h}`]    // hide "Chrome is being controlled by ..."
            args: ['--kiosk', '--disable-infobars', `--window-size=${window_w},${window_h}`]
            //args: ['--kiosk', '--disable-infobars', `--window-size=${window_w},${window_h}`, '--app=http://localhost:8080/']
            // args: ['--start-fullscreen']
        });
        // urls.forEach(l => {
        //     openTab(l);
        // })

        // 設定第一個分頁
        let pages = await browser.pages();
        await pages[0].setViewport({ width: window_w, height: window_h });
        await pages[0].goto('http://localhost:8080/');
        // 關掉第一個分頁
        // await pages[0].bringToFront();
        // await pages[0].close();

        // const page = await browser.newPage();
        // await page.emulate(iphoneX);
        // await page.setViewport({ width: 2560, height: 1440 })
        // await page.setViewport({ width: 1200, height: 1200 })
        // await page.goto(urls[0]);
        
        // await browser.close();
    })()
}
catch (e) {
    console.log('error:',e);
}

app.get('/id/:id', (req, res) => {
    const id = req.params.id;
    res.send('success');
    console.log('rfid:',id);
    keepOneTab();
    if (id%2==1) {
        urls_a.forEach(l => {
            openTab(l);
        })
    }
    else {
        urls_b.forEach(l => {
            openTab(l);
        })
    }
})

app.get('/ddc/:pid', (req, res) => {
    const pid = req.params.pid;
    res.render(pid);
})

app.get('/', (req, res) => {
    keepOneTab();
    res.render('index');
})

http.createServer(app).listen(PORT);
console.log('Starting ISOBAR media server:'+PORT+'\n\n');

const cheerio = require('cheerio');
const http = require('https');

const BASE_STATS_URL = 'https://finance.yahoo.com/quote/';
const BASE_STATS_URL2 = 'https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/sirket-karti.aspx?hisse=';
const TICKERS_URL = 'https://borsa.doviz.com/hisseler';

async function httpRequest(url) {
    return new Promise(function (resolve, reject) {
        var request = http.request(url, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });

        request.on('error', function (e) {
            reject(e);
        });
        request.end();
    });
}

async function getTickers() {
    const data = await httpRequest(TICKERS_URL);
    const $ = cheerio.load(data);
    let tickers = [];
    $('#stocks  > tbody > tr > td > a').each(function (i, element) {
        const text = element.childNodes[0].data;
        tickers.push(text);
    });

    for (let index = 0; index < tickers.length; index++) {
        const t = tickers[index];
        await getStatistics(t + '.IS');
        await getStatisticsIsYatirim(t);
    }
}

async function getStatistics(ticker) {
    const data = await httpRequest(BASE_STATS_URL + ticker + '/key-statistics?p=' + ticker);
    const $ = cheerio.load(data);
    var ev_ebitda = $('span:contains("Enterprise Value/EBITDA")').parent().next().html()
    console.log(ticker + ':' + ev_ebitda);
}

async function getStatisticsIsYatirim(ticker) {
    const data = await httpRequest(BASE_STATS_URL2 + ticker);
    const $ = cheerio.load(data);
    var ev_ebitda = $('th:contains("FD/FAVÖK")').next().html()
    console.log(ticker + ':' + ev_ebitda);
}

getTickers();
var page = require('webpage').create();
var system = require('system');

page.target = system.args[1];
page.referer = system.args[2];
page.userAgent = atob(system.args[3]).trim();
page.needDeep = system.args[4];
page.resolution = system.args[5].split('x');
page.sleep = system.args[6].split('-');

page.settings.userAgent = page.userAgent; // Устанавливаем User Agent
page.viewportSize = { // Устанавливаем размеры страницы
    width: page.resolution[0],
    height: page.resolution[1]
};
page.currentDeep = 1;

var expectedContent = '<a id="link" href="' + page.target + '">link</a>'; // Подготавливаем ссылку для клика
var expectedLocation = page.referer;
page.setContent(expectedContent, expectedLocation); // Наполняем страничку содержимым и Url

page.onResourceRequested = function (requestData, networkRequest) {
    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
    networkRequest.setHeader('User-Agent', page.userAgent);
    var newUrl = requestData.url.replace("1920*1080*24", page.resolution[0] + "*" + page.resolution[1] + "*" + page.resolution[2]);

    newUrl = newUrl.replace("1024", page.resolution[0]);
    newUrl = newUrl.replace("768", page.resolution[1]);
    newUrl = newUrl.replace("32-bit", page.resolution[2] + "-bit");

    networkRequest.changeUrl(newUrl); // Меняем Url
};

page.firstLoad = true;
page.check = true;
page.onLoadFinished = function (status) {
    if (page.firstLoad) {
        page.firstLoad = page.evaluate(function () {
            console.log('Set Referer');
            document.getElementById('link').click(); // Кликаем по созданной ссылке
            return false;
        });
    }
    else {
        if (page.check) { // Да простит меня ассинхронность
            page.check = false;
            window.setInterval(function () {
                page.currentDeep++;
                if (page.currentDeep > page.needDeep) {
                    console.log("Finish: " + status);
                    return close();
                }

                page.evaluate(function (target, deep) {
                    if (document.links.length === 0)
                        return false;

                    var parseUrl = document.createElement('a');
                    parseUrl.href = target;

                    var needLinks = [];
                    for(var i=0; i<document.links.length; i++) { // Выбираем только внутренние ссылки
                        if(document.links[i].href.indexOf(parseUrl.hostname) !== -1)
                            needLinks.push(document.links[i])
                    }

                    var random = Math.floor(Math.random() * needLinks.length);
                    var newLink = document.createElement('a');
                    newLink.setAttribute('href', needLinks[random].href);

                    console.log('Deep: ' + deep + ' URL: ' + newLink.href);
                    newLink.click();

                }, page.target, page.currentDeep);

            }, Math.round(Math.random() * (page.sleep[1] - page.sleep[0]) + page.sleep[0] * 1000))
        }
    }
};

function click(el) {
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent( // Выставляем параметры клика
        "click",
        true, true,
        window, null,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    el.dispatchEvent(ev);
}

page.onConsoleMessage = function (msg) { // выводим лог внутри функций
    console.log(msg);
};

var close = function () { // Для выхода из window.setInterval
    phantom.exit();
};
var page = require('webpage').create();
var system = require('system');

var url = system.args[1];
var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';
page.settings.userAgent = userAgent;

var expectedContent = '<a id="link" href="' + url + '">link</a>';
var expectedLocation = system.args[2];
page.setContent(expectedContent, expectedLocation); // Наполняем страничку содержимым и url

page.onResourceRequested = function (request, network) {
    network.setHeader('User-Agent', userAgent);
};

page.firstLoad = true;
page.onLoadFinished = function (status) {
    if (page.firstLoad) {
        page.firstLoad = page.evaluate(function () {
            console.log('Set Referer');
            document.getElementById('link').click();
            return false;
        });
    }
    else {
        console.log("Status: " + status);
        phantom.exit();
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
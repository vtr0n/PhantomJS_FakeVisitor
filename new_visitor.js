var page = require('webpage').create();
var system = require('system');

page.target = system.args[1];
page.referer = system.args[2];
page.userAgent = atob(system.args[3]).trim();
page.needDeep = system.args[4];
page.resolution = system.args[5].split('x');
page.sleep = system.args[6].split('-');

page.settings.userAgent = page.userAgent; // Set User Agent
page.viewportSize = { // Set page resolution
    width: page.resolution[0],
    height: page.resolution[1]
};
page.currentDeep = 1;

var expectedContent = '<a id="link" href="' + page.target + '">link</a>'; // set content on page
var expectedLocation = page.referer;
page.setContent(expectedContent, expectedLocation); // set content on page

page.onResourceRequested = function (requestData, networkRequest) { // function to change http headers

    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
    networkRequest.setHeader('User-Agent', page.userAgent);

    // 1920*1080*24 - my default resolution. Change it to yours
    var newUrl = requestData.url.replace("1920*1080*24", page.resolution[0] + "*" + page.resolution[1] + "*" + page.resolution[2]);

    // change resolution
    newUrl = newUrl.replace("1024", page.resolution[0]);
    newUrl = newUrl.replace("768", page.resolution[1]);
    newUrl = newUrl.replace("32-bit", page.resolution[2] + "-bit");

    networkRequest.changeUrl(newUrl); // change Url link
};

page.firstLoad = true;
page.check = true;
page.onLoadFinished = function (status) {
    if (page.firstLoad) {
        page.firstLoad = page.evaluate(function () {
            console.log('Set Referer');
            document.getElementById('link').click(); // Click on href
            return false;
        });
    }
    else {
        if (page.check) { // Asynchrony, forgive me
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
                    for (var i = 0; i < document.links.length; i++) { // only internal links
                        if (document.links[i].href.indexOf(parseUrl.hostname) !== -1)
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
    ev.initMouseEvent( // set click params
        "click",
        true, true,
        window, null,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    el.dispatchEvent(ev);
}

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

var close = function () { // exit in window.setInterval
    phantom.exit();
};
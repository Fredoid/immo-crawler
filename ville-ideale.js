var url = require('url');
var request = require('request');
var $ = require('cheerio');

function formate(inputext) {
    var regAccentA = new RegExp("[àâä]", "g");
    var regAccentE = new RegExp("[éèêëÉÈ]", "g");
    var regAccentI = new RegExp("[îïÎ]", "g");
    var regAccentO = new RegExp("[ôö]", "g");
    var regAccentU = new RegExp("[ùûü]", "g");
    var regAccentY = new RegExp("[ÿ]", "g");
    var regCedille = new RegExp("[ç]", "g");
    var regTiret = new RegExp("[-_]", "g");
    inputext = inputext.replace(regAccentA, "A");
    inputext = inputext.replace(regAccentE, "E");
    inputext = inputext.replace(regAccentI, "I");
    inputext = inputext.replace(regAccentO, "O");
    inputext = inputext.replace(regAccentU, "U");
    inputext = inputext.replace(regAccentY, "Y");
    inputext = inputext.replace(regCedille, 'C');
    inputext = inputext.replace(regTiret, ' ');
    inputext = inputext.toUpperCase();
    return inputext;
}

var utcTimestamp = function(){
    var d1 = new Date();
    var d2 = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds());
    return Math.floor(d2.getTime()/ 1000);
}

if(!process.argv[2]) {
    console.log("Give City name as argument. Ex: node ville-ideal.js ventabren")
}


var cityName = process.argv[2];
var cityKeyWords = formate(cityName);


var _ga = request.cookie('_ga=GA1.2.65432718.' + utcTimestamp());
var _gat = request.cookie('_gat=1');

var baseUrl = "http://www.ville-ideale.com/";
var j = request.jar();
var req = {
    url: baseUrl,
    jar: j,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "user-agent": "User-Agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
        "Origin":"http://www.ville-ideale.com",
        "Referer":"http://www.ville-ideale.com/"
        //"Accept":"*/*",
    },
    gzip: true
};

var cookies;
console.log("Call Request");

// Configure request
req.method= 'GET';

request(req, function () {
    cookies = req.jar.getCookies(req.url);
    console.log("Cookies retrieved", cookies);

    if(cookies.length == 0){
        console.log("No cookie retrived");
        return;
    }

    req.jar.setCookie(_ga, req.url);
    req.jar.setCookie(_gat, req.url);
    cookies = req.jar.getCookies(req.url);

    console.log("Cookies with _ga & _gat", cookies);

    // COnfigure Request
    req.url = baseUrl + "scripts/cherche.php";
    req.body = "ville=" + cityKeyWords;
    req.method = "POST";

    request(req, function () {
        console.log("Response Body : " + arguments[2]);
        var data = arguments[2].split(";");
        if(data.length == 0) {
            console.log("Search return no result");
            return;
        }
        console.log("Raw Result : " + data[0]);
        var $data = $("<div>" + data[0] + "</div>");
        var $invs = $data.find(".inv");
        if($invs.length != 2) {
            console.log("Search Result cannot be parsed. 2 invs expected, found " + $invs.length);
            return;
        }

        var reg = new RegExp("[ ']", "g");
        var ville = $($invs[1]).text().replace(reg, '-').toLowerCase();
        var inseeCode = $($invs[0]).text().toLowerCase();

        var cityUri = ville + "_" + inseeCode;
        console.log("ville url = " + cityUri);

        req.url = baseUrl + cityUri + ".php";
        console.log("City Page url = " + req.url);
        request(req, function () {
            var cityPage = $(arguments[2]);
            var rawScore = cityPage.find("#ng");
            var score = rawScore.first().text().split(" / ")[0].replace(",", ".");
            console.log( cityName + " : " + score);
        });

    });
});



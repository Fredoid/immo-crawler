var url = require('url');
var request = require('request');
var $ = require('cheerio');
var promise = require('promise');
var util = require("./util");

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


var _ga = request.cookie('_ga=GA1.2.65432718.' + utcTimestamp());
var _gat = request.cookie('_gat=1');

var baseUrl = "http://www.ville-ideale.com/";

var helper = function(){

    var $this = this;
    var jar = request.jar();
    var cookies;

    var newRequest = function(url, method, body){
        var r = {
            url: url,
            jar: jar,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "user-agent": "User-Agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
                "Origin":"http://www.ville-ideale.com",
                "Referer":"http://www.ville-ideale.com/"
            },
            gzip: true,
            method: method
        };
        if(body)
            r.body = body;
        return r;
    }


    this.init = function(){
        return util.promise(function (resolve, reject) {
            cookies = jar.getCookies(baseUrl);
            if(cookies.length > 0) return resolve();

            var req = newRequest(baseUrl, "GET");
            request(req, function (error, response) {
                cookies = jar.getCookies(req.url);
                if(error)
                    return reject(error);

                if(cookies.length == 0)
                    return reject("Cannot init, no cookie retrived");

                jar.setCookie(_ga, req.url);
                jar.setCookie(_gat, req.url);

                resolve();
            })
        });
    };

    this.getScores = function(cityName){
        return util.promise(function (resolve, reject) {
            var cityKeyWords = formate(cityName);

            // COnfigure Request
            var req = newRequest(baseUrl + "scripts/cherche.php", "POST", "ville=" + cityKeyWords);
            request(req, function (error, response) {
                if(error)
                    return reject(error);

                var data = arguments[2].split(";");
                if(data.length == 0)
                    return reject("Search return no result");

                var $data = $("<div>" + data[0] + "</div>");
                var $invs = $data.find(".inv");
                if($invs.length != 2)
                    return reject("Search Result cannot be parsed. 2 invs expected, found " + $invs.length)

                var reg = new RegExp("[ ']", "g");
                var ville = $($invs[1]).text().replace(reg, '-').toLowerCase();
                var inseeCode = $($invs[0]).text().toLowerCase();

                var cityUri = ville + "_" + inseeCode;

                var req2 = newRequest(baseUrl + cityUri + ".php", "GET");
                request(req2, function () {
                    var cityPage = $(arguments[2]);
                    var rawScore = cityPage.find("#ng");
                    var score = rawScore.first().text().split(" / ")[0].replace(",", ".");
                    return resolve(score);
                });

            });

        });
    }


};

module.exports = helper;

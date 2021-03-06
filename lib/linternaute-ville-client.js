var url = require('url');
var request = require('request');
var $ = require('cheerio');
var util = require('./util')

var baseUrl = "http://www.linternaute.com/";

var helper = function(){

    var $this = this;
    var jar = request.jar();
    var cookies;

	 var cleanCityName = function(cityName){
	 	cityName = cityName.replace(/[1-9]+\D+/gi, "");
	 	cityName = cityName.replace(/\d+/gi, "");
	 	return cityName;
	 } 

	 var newRequest = function(url, method, body){
        var r = {
            url: url,
            jar: jar,
            headers: {},
            gzip: true,
            method: method
        };
        if(body)
            r.body = body;
        return r;
    }

    var regRate = new RegExp(/\((.*?)\/.*/i);
    var setRateIfExists = function(data, prop, input){
        var tmp = regRate.exec(input);
        if(tmp && tmp.length > 1)
            data[prop] = util.cleanDecimal(tmp[1]);
    }

    var parseVille = function($body, uri){
        return util.promise(function (resolve, reject) {

            var $index = $body.find('#index');
            var $tables = $index.find(".odTable");

            if($tables.length == 0)
                return reject("City not found");

            var data = {
                url: uri
            }

            //Departement, region, Code Postal && Insee
            if($tables.length > 0) {
                var $rows = $tables.first().find('tbody tr');
                data.region = util.cleanText($rows.eq(0).find('td').eq(1).text());
                data.department = util.cleanText($rows.eq(1).find('td').eq(1).text());
                data.code_postal = util.cleanText($rows.eq(3).find('td').eq(1).text());
                data.code_insee = util.cleanText($rows.eq(4).find('td').eq(1).text());
            }

            //Population
            if($tables.length > 1) {
                var $rows = $tables.eq(1).find('tbody tr');
                data.population = util.cleanDecimal($rows.eq(0).find('td').eq(1).text().replace(' hab.', ''));
                data.densite = util.cleanDecimal($rows.eq(2).find('td').eq(1).text().replace(' hab/km²', ''));
                data.chomage = util.cleanDecimal($rows.eq(3).find('td').eq(1).text().replace(' %', ''));
            }

            //geo
            if($tables.length > 2) {
                var $rows = $tables.eq(2).find('tbody tr');
                data.superficie = util.cleanDecimal($rows.eq(0).find('td').eq(1).text().replace(' km²', ''));
                data.geopoint = {
                    lat: util.cleanDecimal($rows.eq(3).find('td').eq(1).text()),
                    lon: util.cleanDecimal($rows.eq(4).find('td').eq(1).text())
                }
            }

            var average = $index.find(".jAverage");
            if(average.length > 0){
                data.score_global = util.cleanDecimal(average.first().text());
            }

            // Scores
            var url = baseUrl + $body.find('.ui-tabs-nav a').last().attr("href");
            var req = newRequest(url, "GET");
            request(req, function(error, response, body){
                if(error)
                    return resolve(data);

                var $html = $(body);
                var $avis = $html.find("#avis");
                var $rates = $avis.find('.rating');

                var tmp;

                if($rates.length > 0){
                    var props = [
                        {
                            name: "qualite_vie",
                            scores: [
                                "cadre_de_vie",
                                "espace_vert",
                                "proprete_rue",
                                "absence_pollution",
                                "niveau_securite"
                            ]
                        },

                        {
                            name: "economie",
                            scores: [
                                "dynamisme_emploi",
                                "creation_entreprise"
                            ]
                        },

                        {
                            name: "logement",
                            scores: [
                                "prix_immobilier",
                                "politique_renovation"
                            ]
                        },

                        {
                            name: "impot",
                            scores: [
                                "niveau_taxe_habitation",
                                "niveau_taxe_fonciere"
                            ]
                        },

                        {
                            name: "education",
                            scores: [
                                "densite_ecole",
                                "densite_college",
                                "densite_lycee",
                                "proximite_universite"
                            ]
                        },

                        {
                            name: "sport_loisir",
                            scores: [
                                "qualite_musee",
                                "densite_cinema",
                                "densite_equipement_sportif"
                            ]
                        },

                        {
                            name: "tourisme",
                            scores: [
                                "beaute_site_naturel",
                                "beaute_monument_architecture",
                                "mise_en_valeur_patrimoine",
                                "accueil_touriste"
                            ]
                        },

                        {
                            name: "transport",
                            scores: [
                                "qualite_transport_commun",
                                "frequence_transport_commun",
                                "qualite_reseau_routier",
                                "facilite_stationnement",
                                "fluidite_traffic_automobile"
                            ]
                        }
                    ]
                    var index = 0;
                    var total =  0;
                    var propname;
                    var rubpropname;
                    var cpt = 0;
                    var global = 0;
                    var cpt_global = 0;
                    props.forEach(function(rub){
                        total = 0;
                        cpt = 0;
                        rub.scores.forEach(function(score){
                            propname = "score_" + rub.name + "_" + score;
                            setRateIfExists(data, propname, $rates.eq(index).find('p').eq(1).text());
                            if(data[propname]) {
                                total += data[propname];
                                ++cpt;
                            }
                            ++index;
                        })
                        if(total > 0) {
                            rubpropname = "score_" + rub.name;
                            data[rubpropname] = util.round(total / cpt, 1);
                            global += data[rubpropname];
                            ++cpt_global;
                        }
                    });

                    if(global > 0) {
                        data["score_all"] = util.round(global / cpt_global, 1);
                    }
                }

                return resolve(data);
            })

        });
    }


    this.init = function(){
        return util.promise(function (resolve, reject) {
            resolve();
        });
    };

    this.getData = function(cityName){
        return util.promise(function (resolve, reject) {
            cityName = util.cleanCharacter(cityName);
            cityName = cleanCityName(cityName);
				console.log(baseUrl + "/ville/recherche?q=" + cityName);
            var req = newRequest(baseUrl + "/ville/recherche?q=" + cityName, "GET");
            
            request(req, function (error, response, body) {
                if(error)
                    return reject(error);

                var $html = $(body);
                var $resultList = $html.find(".openData .odListGlossary li");

                if($resultList.length > 0){
                    var req2 = newRequest(baseUrl + $resultList.first().find("a").attr("href"), "GET");
                    request(req2, function(error, response, body){
                        if(error)
                            return reject(error);
                        parseVille($(body), req2.url).then(resolve, reject);
                    })
                }
                else {
                    parseVille($html, req.url).then(resolve, reject);
                }
            });

        });
    }


};

module.exports = helper;

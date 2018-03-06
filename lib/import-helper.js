var elasticClient = require('./elasticsearch-client');
var cacheClient = require('./cache-client');
var modelAds = require('../models/immo');
var modelOffers = require('../models/offers');
var modelCities = require('../models/cities');
var linternauteClient = require('./linternaute-ville-client');
var extend = require('extend');
var util = require("./util");

var elasticRawOfferHelper = new elasticClient(modelAds);
var elasticOfferHelper = new elasticClient(modelOffers);
var elasticCityHelper = new elasticClient(modelCities);
var linternauteHelper = new linternauteClient();

var newObject =  function(obj){
	obj.lastimportdate = obj.importdate;
	obj.firstimportdate = obj.importdate;
	obj.duration = 0;
}

var updateObject =  function (obj, old) {
	obj.lastimportdate = obj.importdate;
	obj.firstimportdate = old.firstimportdate;
	obj.duration = ((new Date(obj.lastimportdate)) - (new Date(obj.firstimportdate))) / (1000*60*60*24);
}

var importHelper = function(){
	var $this = this;
	
	this.init = function(){
		return util.promise(function (resolve, reject) {
			elasticRawOfferHelper.init().then(function(){
	 			elasticOfferHelper.init().then(function(){
	 				elasticCityHelper.init().then(function(){
	 					linternauteHelper.init().then(function(){
							resolve();	 					
	 					}, reject)
	 				}, reject);	
	 			}, reject);
	 		}, reject);
      });
   }	
	
	
	this.import = function(ad, search){
		return util.promise(function (resolve, reject) {
			elasticRawOfferHelper.index(ad).then(function(){
				elasticOfferHelper.updateOrIndex(ad, newObject, updateObject).then(function(data){
					$this.getCity(ad, $this.loadCity).then(function(city){
						ad = extend(true, ad, city);
						elasticOfferHelper.index(ad, data._id).then(function(){
							resolve(ad);	
						}, reject)
					}, reject);
				}, reject);       
			}, reject);
		});
	}
	
	this.getCity = function(ad, notFoundHandler){
		return util.promise(function (resolve, reject) {
			
			var wrapCity = function(city){
				return {
                code_postal: city.code_postal,
                code_insee: city.code_insee,
                population: city.population,
                densite: city.densite,
                chomage: city.chomage,
                superficie: city.superficie,
                geopoint: city.geopoint,
                score_global: city.score_global,
                score_qualite_vie_cadre_de_vie: city.score_qualite_vie_cadre_de_vie,
                score_qualite_vie_espace_vert: city.score_qualite_vie_espace_vert,
                score_qualite_vie_proprete_rue: city.score_qualite_vie_proprete_rue,
                score_qualite_vie_absence_pollution: city.score_qualite_vie_absence_pollution,
                score_qualite_vie_niveau_securite: city.score_qualite_vie_niveau_securite,
                score_qualite_vie: city.score_qualite_vie,
                score_economie_dynamisme_emploi: city.score_economie_dynamisme_emploi,
                score_economie_creation_entreprise: city.score_economie_creation_entreprise,
                score_economie: city.score_economie,
                score_logement_prix_immobilier: city.score_logement_prix_immobilier,
                score_logement_politique_renovation: city.score_logement_politique_renovation,
                score_logement: city.score_logement,
                score_impot_niveau_taxe_habitation: city.score_impot_niveau_taxe_habitation,
                score_impot_niveau_taxe_fonciere: city.score_impot_niveau_taxe_fonciere,
                score_impot: city.score_impot,
                score_education_densite_ecole: city.score_education_densite_ecole,
                score_education_densite_college: city.score_education_densite_college,
                score_education_densite_lycee: city.score_education_densite_lycee,
                score_education_proximite_universite: city.score_education_proximite_universite,
                score_education: city.score_education,
                score_sport_loisir_qualite_musee: city.score_sport_loisir_qualite_musee,
                score_sport_loisir_densite_cinema: city.score_sport_loisir_densite_cinema,
                score_sport_loisir_densite_equipement_sportif: city.score_sport_loisir_densite_equipement_sportif,
                score_sport_loisir: city.score_sport_loisir,
                score_tourisme_beaute_site_naturel: city.score_tourisme_beaute_site_naturel,
                score_tourisme_beaute_monument_architecture: city.score_tourisme_beaute_monument_architecture,
                score_tourisme_mise_en_valeur_patrimoine: city.score_tourisme_mise_en_valeur_patrimoine,
                score_tourisme_accueil_touriste: city.score_tourisme_accueil_touriste,
                score_tourisme: city.score_tourisme,
                score_transport_qualite_transport_commun: city.score_transport_qualite_transport_commun,
                score_transport_frequence_transport_commun: city.score_transport_frequence_transport_commun,
                score_transport_qualite_reseau_routier: city.score_transport_qualite_reseau_routier,
                score_transport_facilite_stationnement: city.score_transport_facilite_stationnement,
                score_transport_fluidite_traffic_automobile: city.score_transport_fluidite_traffic_automobile,
                score_transport: city.score_transport,
                score_all: city.score_all
            };		    		
			}
			elasticCityHelper.search({
				size: 1,
				q: "name:\"" + ad.city + "\""
			}).then(function(offers) {

				if(offers.hits.total == 0){
					if(typeof notFoundHandler == "function"){
		        		notFoundHandler(ad).then(function(city){
							return resolve(wrapCity(city));       		
		        		}, reject);
		        	}
		        	else {
						return reject("City `"+ad.city+"` not found");
					}		        	
				}
				else {
			    	return resolve(wrapCity(offers.hits.hits[0]._source));
		    	}
		    	
			}, function(err){
		   	reject(err);
			});			
		});
	}
	
	this.loadCity = function(ad){
		return util.promise(function (resolve, reject) {
			linternauteHelper.getData(ad.city).then(function(data){
				data.name = ad.city;
				data.lastimportdate = new Date();
				elasticCityHelper.updateOrIndex(data).then(function(){
					resolve(data);
				}, reject);
			}, reject);
		});
	}
}

module.exports = importHelper;
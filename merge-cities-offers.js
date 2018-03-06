var elasticClient = require('./lib/elasticsearch-client');
var elasticsModels = require('./models/elastic-models');

var elasticHelperCities = new elasticClient(elasticsModels.cities);
var elasticHelperOffers = new elasticClient(elasticsModels.offers);

var defaultErrorHandler = function(err) {
    console.log("Error", err);
}

var process = function(){
    console.log("Start Process");
    elasticHelperCities.search({
        size: 10000
    }).then(function(data){

        var next = function(indice){
            if(data.hits.total > indice)
                run(indice);
            else
                elasticHelperOffers.refresh().then(function(){
                    console.log("All cities and offers merged");
                }, defaultErrorHandler);
        }

        var run = function(indice){
            var current = data.hits.hits[indice];
            var bundle = {
                code_postal: current._source.code_postal,
                code_insee: current._source.code_insee,
                population: current._source.population,
                densite: current._source.densite,
                chomage: current._source.chomage,
                superficie: current._source.superficie,
                geopoint: current._source.geopoint,
                score_global: current._source.score_global,
                score_qualite_vie_cadre_de_vie: current._source.score_qualite_vie_cadre_de_vie,
                score_qualite_vie_espace_vert: current._source.score_qualite_vie_espace_vert,
                score_qualite_vie_proprete_rue: current._source.score_qualite_vie_proprete_rue,
                score_qualite_vie_absence_pollution: current._source.score_qualite_vie_absence_pollution,
                score_qualite_vie_niveau_securite: current._source.score_qualite_vie_niveau_securite,
                score_qualite_vie: current._source.score_qualite_vie,
                score_economie_dynamisme_emploi: current._source.score_economie_dynamisme_emploi,
                score_economie_creation_entreprise: current._source.score_economie_creation_entreprise,
                score_economie: current._source.score_economie,
                score_logement_prix_immobilier: current._source.score_logement_prix_immobilier,
                score_logement_politique_renovation: current._source.score_logement_politique_renovation,
                score_logement: current._source.score_logement,
                score_impot_niveau_taxe_habitation: current._source.score_impot_niveau_taxe_habitation,
                score_impot_niveau_taxe_fonciere: current._source.score_impot_niveau_taxe_fonciere,
                score_impot: current._source.score_impot,
                score_education_densite_ecole: current._source.score_education_densite_ecole,
                score_education_densite_college: current._source.score_education_densite_college,
                score_education_densite_lycee: current._source.score_education_densite_lycee,
                score_education_proximite_universite: current._source.score_education_proximite_universite,
                score_education: current._source.score_education,
                score_sport_loisir_qualite_musee: current._source.score_sport_loisir_qualite_musee,
                score_sport_loisir_densite_cinema: current._source.score_sport_loisir_densite_cinema,
                score_sport_loisir_densite_equipement_sportif: current._source.score_sport_loisir_densite_equipement_sportif,
                score_sport_loisir: current._source.score_sport_loisir,
                score_tourisme_beaute_site_naturel: current._source.score_tourisme_beaute_site_naturel,
                score_tourisme_beaute_monument_architecture: current._source.score_tourisme_beaute_monument_architecture,
                score_tourisme_mise_en_valeur_patrimoine: current._source.score_tourisme_mise_en_valeur_patrimoine,
                score_tourisme_accueil_touriste: current._source.score_tourisme_accueil_touriste,
                score_tourisme: current._source.score_tourisme,
                score_transport_qualite_transport_commun: current._source.score_transport_qualite_transport_commun,
                score_transport_frequence_transport_commun: current._source.score_transport_frequence_transport_commun,
                score_transport_qualite_reseau_routier: current._source.score_transport_qualite_reseau_routier,
                score_transport_facilite_stationnement: current._source.score_transport_facilite_stationnement,
                score_transport_fluidite_traffic_automobile: current._source.score_transport_fluidite_traffic_automobile,
                score_transport: current._source.score_transport,
                score_all: current._source.score_all
            };


            var bulk = new elasticHelperOffers.bulk();
            elasticHelperOffers.search({
                size: 10000,
                q: "city:\"" + current._source.name + "\""
            }).then(function(offers) {

                if(offers.hits.total == 0){
                    console.log(indice+1 + "/" + data.hits.total + " no offers for " + current._source.name);
                    return next(indice+1);
                }

                offers.hits.hits.forEach(function(element){
                    try {
                        bulk.update(element._id, bundle);
                    }
                    catch(e) {
                        console.log("Error while bulk.update()", err);
                    }
                });

                bulk.commit().then(function(){
                    console.log(indice+1 + "/" + data.hits.total + " Info ville " + current._source.name + " updated ("+offers.hits.total+" offres)");
                    next(indice+1);
                }, function(err){
                    console.log("Error ("+current._source.name+")", err);
                    next(indice+1);
                });
            }, function(err){
                console.log("Error ("+current._source.name+")", err);
                next(indice+1);
            });
        }
        next(0);
    }, defaultErrorHandler);
}

elasticHelperOffers.init().then(function(){
    elasticHelperCities.init().then(process, defaultErrorHandler);
}, defaultErrorHandler);
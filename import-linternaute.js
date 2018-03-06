var elasticClient = require('./lib/elasticsearch-client');
var linternauteClient = require('./lib/linternaute-ville-client');
var elasticsModels = require('./models/elastic-models');

var elasticHelperCities = new elasticClient(elasticsModels.cities);
var elasticHelperOffers = new elasticClient(elasticsModels.offers);
var linternauteHelper = new linternauteClient();

var defaultErrorHandler = function(err) {
    console.log("Error", err);
}

var process = function(){
    elasticHelperOffers.search({
        body: {
            aggs: {
                all_cities: {
                    terms: {
                        field: 'city',
                        size: 10000,
                        order : { _term : "asc" }
                    }
                }
            }
        }
    }).then(function(data){

        var next = function(indice){
            if(data.aggregations.all_cities.buckets.length > indice)
                run(indice);
            else
                elasticHelperCities.refresh().then(function(){
                    console.log("All cities imported");
                }, defaultErrorHandler);
        }

        var run = function(indice){
            var current = data.aggregations.all_cities.buckets[indice];
            linternauteHelper.getData(current.key).then(function(data){

                data.name = current.key;
                data.lastimportdate = new Date();

                elasticHelperCities.search({
                    q: "code_postal:" + data.code_postal + " AND code_insee:" + data.code_insee,
                    size: 1
                }).then(function(res){
                    var id = null;
                    if(res.hits.total > 0)
                        id = res.hits.hits[0]._id;

                    elasticHelperCities.index(data, id).then(function(){
                        console.log(data.name + " imported");
                        next(indice+1);
                    }, function(err){
                        defaultErrorHandler(err);
                        next(indice+1);
                    });

                }, function(err){
                    defaultErrorHandler(err);
                    next(indice+1);
                })

            }, function(err){
                defaultErrorHandler(err);
                next(indice+1);
            });
        }

        linternauteHelper.init().then(function(){
            next(0);
        }, defaultErrorHandler)
    }, defaultErrorHandler);
}

elasticHelperOffers.init().then(function(){
    elasticHelperCities.init().then(process, defaultErrorHandler);
}, defaultErrorHandler);
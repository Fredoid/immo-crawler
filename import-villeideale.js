var elasticClient = require('./lib/elasticsearch-client');
var villeidealClient = require('./lib/villeideale-client');
var elasticsModels = require('./models/elastic-models');

var elasticHelper = new elasticClient(elasticsModels.cities);
var villeIdealeHelper = new villeidealClient();

var defaultErrorHandler = function(err) {
    console.log("Error", err);
}

var process = function(){
    elasticHelper.search({
        q: "score_global:0",
        size: elasticHelper.SIZE_MAX
    }).then(function(data){
        console.log("Search result", data.hits.length);
        //var bulk = new elasticHelper.bulk();

        villeIdealeHelper.init().then(function(){
            data.hits.forEach(function(element, index){
                setTimeout(function(){
                    villeIdealeHelper.getScores(element._source.name).then(function(score){
                        console.log(element._source.name, score);
                    }, defaultErrorHandler);
                }, 1000 * index);
            });
        }, defaultErrorHandler)
    }, defaultErrorHandler);
}

elasticHelper.init().then(process, defaultErrorHandler);
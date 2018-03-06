var elasticClient = require('./lib/elasticsearch-client');
var geocoder = require('./lib/geocoder');
var elasticsModels = require('./models/elastic-models');

var elasticHelper = new elasticClient(elasticsModels.cities);

var defaultErrorHandler = function(err) {
    console.log("Error", err);
}

var process = function(){
    elasticHelper.search({
        q: "score_global:0",
        size: elasticHelper.SIZE_MAX
    }).then(function(data){
        console.log("Search result", data.hits.length);
        var bulk = new elasticHelper.bulk();
        try {
            var batch = new geocoder.batch(function(results){
                // console.log("Geocoder Results", results);
                results.forEach(function(element){
                    if(!element.geopoint.error) {
                        console.log("One result", element.geopoint);
                        bulk.update(element.source._id, {
                            geopoint: {
                                lat: element.geopoint.value.latitude,
                                lon: element.geopoint.value.longitude
                            }
                        });
                    }
                });
                bulk.commit();
            }, defaultErrorHandler);
            // var i = data.hits.length;
            data.hits.forEach(function(element){
                // console.log("One city", element);
                batch.add(element._source, element._source.name + " " + element._source.department);
            });
            batch.geocode();

        }
        catch(e) {
            console.log("Process Error: ", e);
        }

/*
        var i = data.hits.length;
        data.hits.forEach(function(element) {
            console.log(i);
            try {
                geocoder.geoCode(element._source.name + " " + element._source.department).then(function (point) {
                    console.log("One city geocoded");
                    bulk.update(element._id, {geopoint: point});
                    --i;
                    if (i == 0) bulk.commit();
                }, function(err){
                    --i;
                    if (i == 0) bulk.commit();
                    defaultErrorHandler(err);
                });
            }
            catch (e) {
                console.log("Process Error: ", e);
            }
        });
*/


    }, defaultErrorHandler);
}



elasticHelper.init().then(process, defaultErrorHandler);
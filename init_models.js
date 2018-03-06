var elasticClient = require('./lib/elasticsearch-client');
var elasticsModels = require('./models/elastic-models');

var models = [];
for(var model in elasticsModels){
    models.push(model);
}

var next = function(index){
    if(models.length > index)
        return run(index);
    else {
        console.log("Initialisation finished");
        process.exit();
    }
}

var elasticHelper;
var run = function(index){
    elasticHelper = new elasticClient(elasticsModels[models[index]]);
    elasticHelper.init().then(function(){
        console.log("Model", '"' + models[index] + '"', "initialized");
        next(index+1);
    }, function(err){
        console.log("Model", '"'  + models[index] + '"', "in error:", err);
        next(index+1);
    })
}

next(0);
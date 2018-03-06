var elasticClient = require('./lib/elasticsearch-client');
var cacheClient = require('./lib/cache-client');
var leboncoinClient = require('./lib/leboncoin-client');
var elasticsModels = require('./models/elastic-models');

var cache = new cacheClient("cache");

var elasticHelper = new elasticClient(elasticsModels.ads);
var offersElasticHelper = new elasticClient(elasticsModels.offers);

var nautisme = {
    search: "nautisme",
    baseUrl : {
        protocol: "https",
        hostname: "www.leboncoin.fr",
        pathname: "/nautisme/offres/provence_alpes_cote_d_azur/bonnes_affaires/",
        port: 443,
        method: "GET",
        encoding: 'utf8'
    },
    pages: 10,
    params: {
        th: 1,
        it:1
    }
};

var immo = {
    search: "immo",
    baseUrl : {
        protocol: "https",
        hostname: "www.leboncoin.fr",
        pathname: "/ventes_immobilieres/offres/provence_alpes_cote_d_azur/",
        port: 443,
        method: "GET",
        encoding: 'utf8'
    },
    pages: 5,
    params: {
        th: 1,
        ret:3
    }
}

var maison = {
    search: "maison",
    baseUrl : {
        protocol: "https",
        hostname: "www.leboncoin.fr",
        pathname: "/ventes_immobilieres/offres/provence_alpes_cote_d_azur/",
        port: 443,
        method: "GET",
        encoding: 'utf8'
    },
    pages: 1000,
    params: {
        th:1,
        pe:15,
        sqs:10,
        ret:1
    }
}

var currentSearch = immo;

var leBonCoinHelper = new leboncoinClient(maison, cache);

elasticHelper.init().then(function(){
	 offersElasticHelper.init().then(function(){
	    leBonCoinHelper.run(function(ad){
	        console.log(ad);
/*	        
	        elasticHelper.index(ad).then(function(){
					offersElasticHelper.updateOrIndex(ad, function(obj){
						obj.lastimportdate = obj.importdate;
						obj.firstimportdate = obj.importdate;
						obj.duration = 0;
					}, function (obj, old) {
						obj.lastimportdate = obj.importdate;
						obj.firstimportdate = old.firstimportdate;
						obj.duration = ((new Date(obj.lastimportdate)) - (new Date(obj.firstimportdate))) / (1000*60*60*24);
					}).then(function(){
						console.log("New offer added", ad.offerid);
					}, function(error){
	         	   console.log("Error adding offer", error);
	        		});       
	        }, function(error){
	            console.log("Error adding ad", error);
	        });
	        */
	    }, function(){
	        process.exit();
	    });
	});
});




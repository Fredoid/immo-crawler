var cacheClient = require('./lib/cache-client');
var selogerClient = require('./lib/seloger-client');
var importHelper = require('./lib/import-helper');

var cache = new cacheClient("cache");
var importer = new importHelper(); 

var maison = {
    search: "maison",
    baseUrl : {
        protocol: "http",
        hostname: "www.seloger.com",
        pathname: "list.htm",
        port: 80,
        method: "GET",
        encoding: 'utf8'
    },
    pages: 2,
    params: {
        pxmax: 400000,
        idtt:2,
        idtypebien: 2,
        div: 2246,
        tri: "initial",
        naturebien: "1,2,4"
    },
    extradata: {
		type: "maison"    
    }
};

var currentSearch = maison;

var selogerHelper = new selogerClient(currentSearch, cache);

importer.init().then(function(){
	selogerHelper.init().then(function(){
		selogerHelper.run(function(ad){
			importer.import(ad, currentSearch).then(function(ad){
				console.log("Offer `" + ad.offerid +"` from `" + ad.source + "` imported");
			}, function(error){
				console.log("Error while importing offer", error);		
			});   	
	    }, function(){
	        process.exit();
	    });
	}, function(error){
		console.log("Error while selogerHelper initializing", error);	
	})
});




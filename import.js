var cacheClient = require('./lib/cache-client');
var importHelper = require('./lib/import-helper');
var extend = require("extend");
var process = require("process");
var path = require("path");

var error = function(err){
	console.log("Erreur : ");
	console.log("         " + err);
	console.log("");
} 

var usage = function(){
	console.log("Usage:");
	console.log("     node " + path.basename(process.argv[1]) + " <config_name>");
	console.log("");
}


if(process.argv.length < 3){
	error("Nombre de paramètre incorect");
	usage();	
	return;
}

var configName = process.argv[2];
var currentConfig = require("./config/config-" + configName);
if(!currentConfig || currentConfig == null){
	error("Config `"+config+"` introuvable");
	usage();
}

var cache = process.env.USE_CACHE && process.env.USE_CACHE == "yes"
	? new cacheClient("cache")
	: null;
	
var importer = new importHelper(); 

var next = function(indice, config){
	if(indice >= config.providers.length){
		console.log("Import Process Finished `"+ config.search.search +"`");			
		// return process.exit();
	}
		
	proc(indice, config);
}	

var proc = function(indice, config){

	try {
	
		var provider = config.providers[indice];
		var cfg = extend(true, {}, config.search, provider);
		var helperLib = require("./lib/" + provider.helper);
		var helper = new helperLib(cfg, cache);
		
		console.log(provider.name, "Start import");
		helper.init().then(function(){
			helper.run(function(ad){
				console.log(provider.name, "Offer `" + ad.offerid +"` loaded", ad);
				importer.import(ad, cfg).then(function(ad){
					console.log(provider.name, "Offer `" + ad.offerid +"` imported");
					console.log(ad);
				}, function(error){
					console.log(provider.name, "Error while importing offer", ad.offerid, error);		
				});   	
		    }, function(){
		    	console.log(provider.name, "Import Finished");
		      next(indice+1, config);
		    });
		}, function(error){
			console.log(provider.name, "Error while initializing helper", error);
			next(indice+1, config);	
		});
	}
	catch (error){
		console.log(provider.name, "Error while instanciating helper", error);
		next(indice+1, config);
	}			
}

importer.init().then(function(){
	console.log("Start Import Process `"+currentConfig.search.search+"`");
	next(0, currentConfig);
});




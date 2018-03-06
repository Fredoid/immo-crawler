var url = require('url');
var moment = require('moment');
var $ = require('cheerio');
var request = require('request');
var iconv = require('iconv-lite');
var extend = require("extend");
var util = require('./util');
var StringDecoder = require('string_decoder').StringDecoder;

var decoder = new StringDecoder('utf8');

class clientBase {

	constructor(params, cache) {
		this.params = params;
		this.cache = cache;
		this.cookies = request.jar();
		this.pageParam = "";
		this.nbMaxPage = 0;
	}
	
	
	newQuery(url){
		return {
			url: url,
		 	jar: this.cookies, 
		 	encoding: null,
		 	headers: {
				'User-Agent': "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36"
			}		
		}		
	}

	init(){
		var $this = this;
		return util.promise(function (resolve, reject) {
			$this._connect().then(resolve, reject);
		});
	}

	_connect(){
		var $this = this;
		return util.promise(function (resolve, reject) {
			var query = $this.newQuery($this._buildUrl({
				protocol: $this.params.baseUrl.protocol,
				hostname: $this.params.baseUrl.hostname,
				port: $this.params.baseUrl.port,
				method: "GET",
				encoding: 'utf8'
			}));
			
			request(query, function (error, response, body) {
				if (error)
            	return reject(error);

				resolve(body);
         });			
		});
	}

	run(resultHandler, endHandler, page){
		var $this = this;
		
      if(!page) page = 1;
      if(page > $this.params.pages) return endHandler();
		if($this.nbMaxPage > 0 && page > $this.nbMaxPage) return endHandler();

		console.log($this.params.name, "Run Start on page ", page);

		$this.params.params[$this.pageParam] = page;
		$this._callSearch().then(function(html){
			$this.nbMaxPage = $this.maxPages(html);
			$this._parseSearchResults(html).then(function($results){
				var next = function(indice){
					if($results.length == 0){
						console.log($this.params.name, "Warning", "No result found");
						return endHandler();
					}
					
					if($results.length > indice)
						proc(indice);
					else
						$this.run(resultHandler, endHandler, page+1);
				}

				var proc = function(indice){
					$this._parseSearchResult($results.eq(indice)).then(function(data){
						try {
							// general treatment						
							data.importdate = moment().format();
							data.search = $this.params.search;
							if($this.params.extradata){
								data = extend(true, data, $this.params.extradata);						
							}
							// Last Sanitize
							data.area = util.sanitize(data.area, 0);
							data.price = util.sanitize(data.price, 0);
							data.title = util.sanitize(data.title, "");
							data.content = util.sanitize(data.content, "");
							data.city = util.sanitize(util.cleanCity(data.city), "").toLowerCase();
							data.dept = util.sanitize(data.dept, "").toLowerCase();						
							console.log("client-base", "run() end");
							resultHandler(data);
						}
						catch (err) {
							console.log($this.params.name, "Error", err);	
						}
						next(indice+1);
					}, function(err){
						console.log($this.params.name, "Error", err);
						next(indice+1);
					});
				}
				next(0);
			});
		})
	}

   _buildUrl(obj){
   	var $this = this;
		obj = typeof obj != "undefined" ? obj : JSON.parse(JSON.stringify($this.params.baseUrl));
		obj.query = $this.params.params;
		var uri = url.parse(url.format(obj));
		uri.path = uri.pathname + uri.search;
		uri.uri = uri.href;
		return uri;
   }

	convertEncoding(content){
		return content;	 
	}
	
	maxPages(html){
		return this.params.pages;
	}

   _call(url){
   	var $this = this;
		return util.promise(function (resolve, reject) {
			var _get = function () {
				request($this.newQuery(url), function (error, response, body) {
					if (error)
						return reject(error);

					body = $this.convertEncoding(body); 

					if($this.cache)
						$this.cache.store(util.toUri(url.href), body).then(resolve, reject);
					else{
						resolve(decoder.write(body));
					}
				});
			};

         if($this.cache)
				$this.cache.get(util.toUri(url.href)).then(resolve, _get);
			else
				_get();
		});
	};

   _callSearch(){
   	var $this = this;
		return util.promise(function (resolve, reject) {
			$this._call($this._buildUrl()).then(resolve, reject);
		});
	};


   _callItem(ad){
   	var $this = this;
   	return util.promise(function (resolve, reject) {
			if(ad.url == "/") return reject("ad's url not valid");      	
      	
      	var obj = url.parse(ad.url);
			obj.uri = ad.url;
			$this._call(obj).then(resolve, reject);
		});
	};

	detailItem(res){
		var $this = this;
		return util.promise(function (resolve, reject) {
			$this._callItem(res).then(function (html) {
         	$this._parseItem(res, html).then(function(ad){
            	resolve(ad);
				}, function(err){
					console.log($this.params.name, "detailItem", "Error", err)
               reject(err);
				});
			}, reject);
		});
	};
}

module.exports = clientBase;
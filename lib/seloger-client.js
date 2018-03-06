var clientBase = require('./client-base');
var $ = require('cheerio');
var util = require('./util');


class seLogerHelper extends clientBase {

	constructor(params, cache){
		super(params, cache);
		this.pageParam = "LISTING-LISTpg";
	}
	
	maxPages(html){
		return util.cleanDecimal($(html).find(".annonce_footer_pagination > .pagination-bloc1 > .mobile-pagination-number").text().split("/")[1]);
	}
   
   _parseSearchResults(html){
   	var $this = this;
		return util.promise(function (resolve, reject) {
			try {
				resolve($(html).find("section.liste_resultat > .c-pa-list"));
			} catch (err) {
				console.log($this.params.name, "Error in parsing results", err);
				reject(err);
			}
		});
	};

   _parseSearchResult($result){
   	var $this = this;
		return util.promise(function (resolve, reject) {
			try {      
			
				var $title = $result.find(".c-pa-link");	
				var res =  {
					url: util.cleanText($title.attr("href"))
				};
				
				$this.detailItem(res).then(resolve, reject);

			} catch (err) {
				console.log($this.params.name, "Error in parsing result", err);
				reject(err);
			}
		});
	};

	_parseItem(ad, html){
		var $this = this;
		return util.promise(function (resolve, reject) {      
			try {   
				var $html = $(html);
				var $script = $html.find("script").filter((index,src) => $(src).html().substring(0, 50).indexOf("var ava_data") > -1);
				var objReg = new RegExp(/var ava_data = {([\s\S]*)}/i);     
				var objMatch = objReg.exec(util.cleanText($script.text()));
				if(typeof objMatch == "undefined" || !objMatch || objMatch == null || objMatch.length == 0){
					return reject("Impossible de parser l'offre " + ad.url);				
				}
					
				var json = '{' + objMatch[1].replace("logged: logged,", "").replace(/ '/g, ' "').replace(/' /g, '" ') + '}';
				var d = eval("(" + json + ")").products[0];            
            
				ad.area = util.cleanDecimal(d.surface);
				ad.price = util.cleanDecimal(d.prix);
				ad.content = util.cleanText($html.find("js-descriptifBien").text());  
				ad.city = util.cleanText(d.ville);
				ad.offerid =  util.cleanDecimal(d.idannonce); 
				ad.title = util.cleanText($html.find("h1.detail-title").text());      
				ad.source = "seloger";            
            
				resolve(ad);

			} catch (err) {
				console.log($this.params.name, "Error in parsing item", err);
				reject(err);
			}
		});
	};
}

module.exports = seLogerHelper;
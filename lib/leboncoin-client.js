var clientBase = require('./client-base');
var $ = require('cheerio');
var util = require('./util');
var iconv = require('iconv-lite');

class leBonCoinHelper extends clientBase {

	constructor(params, cache){
		super(params, cache);
		this.pageParam = "o";
	}

	convertEncoding(content){
		content = iconv.decode(content, 'win1252');
		return iconv.encode(content, 'utf8');
	}

	_parseSearchResults(html){
		var $this = this;
		return util.promise(function (resolve, reject) {
			try {
				resolve($(html).find(".tabsContent > ul > li"));
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
				var sups = $result.find(".item_supp");
				var location = util.cleanText($(sups[1]).text());
				var locations = location.split("/");

				var res =  {
					title:  util.cleanText($result.find(".item_title").text()),
					city : util.cleanText(locations[0]),
					dept : util.cleanText(locations[1]),
					url: util.cleanText($this.params.baseUrl.protocol + ":" + $result.find("a.list_item").attr("href"))
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
				var matchInfo, tmp, areaM, regInfo;
				var $html = $(html);
				var regAreaM = new RegExp(/\s*-?((\d{1,3}(\s(\d){3})*)|\d+)((,|\.)\d{1,3})?\s*?(m²|m2)/i);
				var regAreaH = new RegExp(/\s*-?((\d{1,3}(\s(\d){3})*)|\d+)((,|\.)\d{1,3})?\s*?hectare/i);
				var areaM;
				var areaH;
				var priceMatch;
				var areaFields = ["title", "content"];



				var $script = $html.find("script").filter((index,src) => $(src).html().substring(0, 50).indexOf("window.FLUX_STATE =") > -1);
				var objReg = new RegExp(/window.FLUX_STATE = {([\s\S]*)}/i);     
				var objMatch = objReg.exec(util.cleanText($script.text()));
				if(typeof objMatch == "undefined" || !objMatch || objMatch == null){
					return reject("Impossible de parser l'offre " + ad.url);				
				}
					
				var json = '{' + objMatch[1].replace(/ '/g, ' "').replace(/' /g, '" ') + '}';
				var d = eval("(" + json + ")").adview;            
            
            


				// Get Content
				//var $content = $html.find("section.properties > .line.properties_description > .value")
				//if($content && $content.length > 0){
				//	ad.content = util.cleanText($content.text());
				//}
				ad.content = d.body;

				// Get Price				
				//var regPrice = new RegExp(/\s*-?((\d{1,3}(\s(\d){3})*)|\d*)((,|\.)\d{1,2})?\s?(\u20AC)?\s*/);
				//var $price = $html.find("section.properties > .line > .item_price > .value");
				//if($price && $price.length > 0){
				//	priceMatch = regPrice.exec(util.cleanText($price.text()));
				//	if(priceMatch && priceMatch.length > 1) {
				//		ad.price = util.cleanDecimal(util.cleanText(priceMatch[2]));
				//	}
				//}
				ad.price = d.price[0];
				
				

				// Get Type
				/*				
				regInfo = new RegExp(/<script.*?>(\n|.)*?utag_data = ((\n|.)*?)surfacemin((\n|.)*?)type : "(.*?)"(\n|.)*<\/script>/gmi);
				matchInfo = regInfo.exec(html);
				if (matchInfo && matchInfo.length > 1){
					ad.type = util.cleanText(matchInfo[6]);
				}
				*/

				// Offer Id
				regInfo = new RegExp(/<script.*?>(\n|.)*?utag_data = ((\n|.)*?)listid : "(.*?)"(\n|.)*<\/script>/gmi);
				matchInfo = regInfo.exec(html);
				if (matchInfo && matchInfo.length > 1){
					ad.offerid = util.cleanDecimal(matchInfo[4]);
				}
				ad.offerid = d.list_id;

				// Get Area
				/*
				regInfo = new RegExp(/<script.*?>(\n|.)*?utag_data = ((\n|.)*?)surface : "(.*?)"(\n|.)*<\/script>/gmi);
				matchInfo = regInfo.exec(html);
				if (matchInfo && matchInfo.length > 1){
					ad.area = util.cleanDecimal(matchInfo[4]);
				}
				*/
				var square = d.attributes.filter(f => f.key == "square");
				
				ad.area = square.length > 0 ? util.cleanDecimal(square[0].value) : 0;

				// Area Bis
				// Search in others fields to find Area, if needed
				/*
				if(!ad.area || ad.area == 0){
					for(var i = 0 ; i < areaFields.length ; ++i){
						areaM = regAreaM.exec(ad[areaFields[i]]);
						if(areaM && areaM.length > 1){
							ad.area = util.cleanDecimal(areaM[1]);
							break;
						}
						else {
							areaH = regAreaH.exec(ad[areaFields[i]]);
							if(areaH && areaH.length > 1){
								ad.area = util.cleanDecimal(areaH[1] + areaH[5]) * 10000;
								break;
							}
						}
					}
				}
				*/

				ad.source = "leboncoin";

				resolve(ad);

			} catch (err) {
				console.log($this.params.name, "Error in parsing result", err);
				reject(err);
			}
		});
	};
}

module.exports = leBonCoinHelper;
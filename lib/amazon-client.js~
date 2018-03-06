var clientBase = require('./client-base');
var $ = require('cheerio');
var util = require('./util');
var iconv = require('iconv-lite');

class AmazonHelper extends clientBase {

	constructor(params, cache){
		super(params, cache);
		this.pageParam = "page";
	}

	convertEncoding(content){
		return content;
	}

	maxPages(html){
		var $pages = $(html).find("#pagn").find("span:not(.pagnLA1):not(.pagnRA)");
		if($pages.length == 0)
			return 1;
		return util.cleanDecimal($pages.last().text());
	}

	_parseSearchResults(html){
		console.log("_parseSearchResults()");
		var $this = this;
		return util.promise(function (resolve, reject) {
			try {
				//s-item-container
				var $html = $(html); 
				var $res = $html.find("ul.s-results-list-atf > li");
				//console.log("amazon-client", "_parseSearchResults(), $res 1", $res);
				if($res.length == 0)
					$res = $html.find(".s-item-container").first();

				//console.log("amazon-client", "_parseSearchResults(), $res 2", $res);
				resolve($res);
			} catch (err) {
				console.log($this.params.name, "Error in parsing results", err);
				reject(err);
			}
		});
	};

	_parseSearchResult($result){
		console.log("_parseSearchResult()");
		var $this = this;
		return util.promise(function (resolve, reject) {
			try {
//				\/([\d-]+?)\?
				
				var $title = $result.find(".s-access-title").first();
				var res =  {
					title:  util.cleanText($title.attr("data-attribute")),
					url: util.cleanText($title.parent('a').attr("href")),
					price: util.cleanDecimal($result.find(".s-price").text()),
					auhtor: util.cleanText($result.find(".a-col-right > .a-row:nth-child(1) > .a-row:nth-child(2)").text())
				};
				var reg = new RegExp(/\/([\d-]+?)\?/i);
				var rsOfferId = reg.exec(res.url);
				if(rsOfferId && rsOfferId.length > 1){
					res.offerid = util.cleanDecimal(rsOfferId[1].replace("-",""));
				}
				
				console.log("_parseSearchResult() end");
				resolve(res);
				// $this.detailItem(res).then(resolve, reject);

			} catch (err) {
				console.log($this.params.name, "Error in parsing result", err);
				reject(err);
			}
		});
	};
}

module.exports = AmazonHelper;
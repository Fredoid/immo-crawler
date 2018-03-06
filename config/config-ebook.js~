var bureau = {
	 search: {
	 	search: "ebook",
	 	pages: 10
	 },
    providers: [
    
		{
			name: "Amazon Ebook",
			helper: "amazon-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.amazon.fr",
		        pathname: "/s/ref=nb_sb_noss",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        url: "search-alias=digital-text",
		        "field-keywords" : "Plutarque La vie de Pericles",
		        rh: "k:Plutarque La vie de Pericles"
		    }
		}
    ]
};

module.exports = bureau;
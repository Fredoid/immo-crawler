var locationConfig = {
	 search: {
	 	search: "location",
	 	pages: 1000
	 },
    providers: [
		{
			name: "LeBonCoin.com Location Maison",
			helper: "leboncoin-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.leboncoin.fr",
		        pathname: "/locations/offres/provence_alpes_cote_d_azur/bouches_du_rhone/",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        mre:1200,
		        ros:4,
		        ret:1,
		        furn:2
		    }
		},
		{
			name: "LeBonCoin.com Location Appart",
			helper: "leboncoin-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.leboncoin.fr",
		        pathname: "/locations/offres/provence_alpes_cote_d_azur/bouches_du_rhone/",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        mre:1200,
		        ros:4,
		        ret:2,
		        furn:2
		    }
		},
		{
			name: "Seloger.com Location Appart",
			helper: "seloger-client",
			pages: 100,
			baseUrl : {
		        protocol: "http",
		        hostname: "www.seloger.com",
		        pathname: "list.htm",
		        port: 80,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        idtt:1,
		        idtypebien:1,
		        cp:13,
		        si_meuble:0,
		        tri:'initial',
		        nb_pieces:'4,5 et +',
		        pxmax:1200,
		        naturebien:1
		    },
		    extradata: {
				type: "appartement"    
		    }
		},
		{
			name: "Seloger.com Location Maison",
			helper: "seloger-client",
			pages: 100,
			baseUrl : {
		        protocol: "http",
		        hostname: "www.seloger.com",
		        pathname: "list.htm",
		        port: 80,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        idtt:1,
		        idtypebien:2,
		        cp:13,
		        si_meuble:0,
		        tri:'initial',
		        nb_pieces:'4,5 et +',
		        pxmax:1200,
		        naturebien:1
		    },
		    extradata: {
				type: "maison"    
		    }
		 }
    ]
};


module.exports = locationConfig;
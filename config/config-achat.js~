var maisonConfig = {
	 search: {
	 	search: "maison",
	 	pages: 1000
	 },
    providers: [
    
		{
			name: "Seloger.com",
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
		        pxmax: 400000,
		        idtt:2,
		        idtypebien: 2,
		        ci: "130114,130118,130032,130920,130001,130113",
		        tri: "initial",
		        naturebien: "1,2,4",
		        nb_pieces: "4,5%20et%20%2b"
		    },
		    extradata: {
				type: "maison",
				dept: "Bouches-du-Rhône"   
		    }
		},
		
		{
			name: "LeBonCoin.com Ventabren Coudoux Venelle",
			helper: "leboncoin-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.leboncoin.fr",
		        pathname: "/ventes_immobilieres/offres/provence_alpes_cote_d_azur/",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        th:1,
		        location: "Ventabren 13122,Coudoux 13111,Venelles 13770",
		        pe:15,
		        ros:4,
		        ret:1
		    },
		    extradata: {
				type: "maison" 
		    }
		},
		
		{
			name: "LeBonCoin.com Aix en provence Les milles",
			helper: "leboncoin-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.leboncoin.fr",
		        pathname: "/ventes_immobilieres/offres/provence_alpes_cote_d_azur/",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        th:1,
		        location: "Aix-en-Provence 13100,Aix-en-Provence 13090,Les Milles 13290",
		        pe:15,
		        ros:4,
		        ret:1
		    },
		    extradata: {
				type: "maison" 
		    }
		},
		
		{
			name: "LeBonCoin.com Eguille",
			helper: "leboncoin-client",
			baseUrl : {
		        protocol: "https",
		        hostname: "www.leboncoin.fr",
		        pathname: "/ventes_immobilieres/offres/provence_alpes_cote_d_azur/",
		        port: 443,
		        method: "GET",
		        encoding: 'utf8'
		    },
		    params: {
		        th:1,
		        location: "Eguilles 13510",
		        pe:15,
		        ros:4,
		        ret:1
		    },
		    extradata: {
				type: "maison" 
		    }
		}
    ]
};

module.exports = maisonConfig;
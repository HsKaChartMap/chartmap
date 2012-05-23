var getThematicStyle = function(dataArray, numClasses) {
		
	var thematicStyle = new OpenLayers.Style({
			strokeColor:'#ffffff',
			strokeOpacity:0.5,
			fillColor: '#999966',
			fillOpacity: 0.5
			});
	
	
	//KLASSE 1
	var filterKlasse1 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.0 && attributes['HDI'][2010] < 0.2) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		
		//creating new rules for Style
		var Klasse1 = new OpenLayers.Rule({
			filter: filterKlasse1,
			symbolizer: { fillColor: "#FFC6A5",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
		
		
		//KLASSE 2
		var filterKlasse2 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.2 && attributes['HDI'][2010] < 0.4) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		var Klasse2 = new OpenLayers.Rule({
			filter: filterKlasse2,
			symbolizer: { fillColor: "#FF9473",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
		
		
		//KLASSE 3
		var filterKlasse3 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.4 && attributes['HDI'][2010] < 0.5) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		
		var Klasse3 = new OpenLayers.Rule({
			filter: filterKlasse3,
			symbolizer: { fillColor: "#FF6342",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
		
		
		//KLASSE 4
		var filterKlasse4 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.5 && attributes['HDI'][2010] < 0.6) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		
		var Klasse4 = new OpenLayers.Rule({
			filter: filterKlasse4,
			symbolizer: { fillColor: "#FF3118",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
		
		
		
		//KLASSE 5
		var filterKlasse5 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.6 && attributes['HDI'][2010] < 0.8) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		
		var Klasse5 = new OpenLayers.Rule({
			filter: filterKlasse5,
			symbolizer: { fillColor: "#FF0000",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
		
		//KLASSE 6
		var filterKlasse6 = new OpenLayers.Filter.Function({
				evaluate: function(attributes) {
					if (attributes['HDI']) {
						if (attributes['HDI'][2010] >= 0.8 && attributes['HDI'][2010] < 1.0) {
							return true;
						}
						else {
							return false;
						}
					}
					else {
						return false;
					}
				}
			})
		
		
		var Klasse6 = new OpenLayers.Rule({
			filter: filterKlasse6,
			symbolizer: { fillColor: "#AD0000",
						fillOpacity: 0.5, strokeColor: "white"}
		});
		
	//adding rule to Style
		thematicStyle.addRules([Klasse1, Klasse2, Klasse3, Klasse4, Klasse5, Klasse6]);
	
	
	
	
	return thematicStyle;

}
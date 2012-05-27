var getThematicStyle = function(layername, indicator, year, classificationType, numClasses, colors) {
    
    var matchingLayers;
    var vectorLayer;
    var items = new Array();
    var serie;
    var rules = new Array();
    var filter_x;
    var styleMapObject;
    var thematicStyle;
    
    //check whether numClasses and colors fit together
    if (numClasses != colors.length) {
        console.log("getThematicStyle: Warning, the numbers of classes and the number of colors do not fit");
        return;
    }
    
    //get vector layer by the given layername
    matchingLayers = map.getLayersByName(layername);
    if (matchingLayers.length == 1) {
        vectorLayer = matchingLayers[0];
    }
    else {
        console.log("getThematicStyleMap: Warning, " + matchingLayers.length + " layers found!");
        return;
    }
    
    // defines default values of the thematic style
    thematicStyle = new OpenLayers.Style({
        strokeColor:'#ffffff',
        strokeOpacity:0.5,
        fillColor: 'green',
        fillOpacity: 0.5
    });
    
    // extract necessary data items
    for (var i=0;i < vectorLayer.features.length;i++) {
        if (vectorLayer.features[i]['data'][indicator]) {
            items.push(vectorLayer.features[i]['data'][indicator][year]);
        }
    }
    
    // create geostats serie
    serie = new geostats(items);
    ranges = serie.getQuantile(numClasses);
    console.log("Farben: " + colors);
    console.log("anzKlassen: " + numClasses);
    console.log("Klassen(" + ranges.length + "): " + ranges);
    
    
    for (var i = 0; i < numClasses-1; i++) {
        //console.log("Klasse" + (i+1) + ": " + parseFloat(ranges[i]) + "-" + ranges[i+1] + ", Farbe: " + colors[i]);
        filter_x = new OpenLayers.Filter.Function({
                evaluate: function(attributes) {
                    if (attributes[indicator]) {
                        //if (attributes[indicator][year] >= parseFloat(ranges[0]) && attributes[indicator][year] < parseFloat(ranges[2])) {
                        if (attributes[indicator][year] >= parseFloat(ranges[i]) && attributes[indicator][year] < parseFloat(ranges[i+1])) {
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
        var rule_x = new OpenLayers.Rule({
            filter: filter_x,
            symbolizer: { fillColor: colors[i],
                        fillOpacity: 0.5, strokeColor: "white"}
        });
        var clone = filter_x.clone();
        rules[i] = rule_x;
    
    }
    //thematicStyle.addRules(rules); // does not work yet...
    
   
    //KLASSE 1
    var filterKlasse1 = new OpenLayers.Filter.Function({
                evaluate: function(attributes) {
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.0 && attributes[indicator][year] < 0.2) {
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
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.2 && attributes[indicator][year] < 0.4) {
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
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.4 && attributes[indicator][year] < 0.5) {
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
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.5 && attributes[indicator][year] < 0.6) {
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
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.6 && attributes[indicator][year] < 0.8) {
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
                    if (attributes[indicator]) {
                        if (attributes[indicator][year] >= 0.8 && attributes[indicator][year] < 1.0) {
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


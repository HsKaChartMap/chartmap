function getThematicStyle(layername, indicator, year, classificationType, numClasses, colors) {
    
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
        fillColor: 'white',
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
    // get ranges according to the given classification type
    switch (classificationType) {
        case "eqinterval": ranges = serie.getEqInterval(numClasses); break;
        case "quantiles": ranges = serie.getQuantile(numClasses); break;
        case "jenks": ranges = serie.getJenks(numClasses); break;
    }
    
    // loop through numClasses and create filter & rule for each thematic class
    for (var i = 0; i < numClasses; i++) (function (i) {
        // for debugging
        //console.log("Klasse" + (i+1) + ": " + parseFloat(ranges[i]) + "-" + ranges[i+1] + ", Farbe: " + colors[i]);
        filter_x = new OpenLayers.Filter.Function({
                evaluate: function(attributes) {
                        if (attributes[indicator]) {
                            if ((attributes[indicator][year] >= parseFloat(ranges[i]) && attributes[indicator][year] < parseFloat(ranges[i+1]) || attributes[indicator][year] == parseFloat(ranges[numClasses]))) {
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
            name: Math.round(ranges[i],2) + " - " + Math.round(ranges[i+1],2),
            filter: filter_x,
            symbolizer: { fillColor: colors[i],
                        fillOpacity: 0.5, strokeColor: "white"}
        });
        rules.push(rule_x);    
    })(i);
    thematicStyle.addRules(rules);
    
    return thematicStyle;
}


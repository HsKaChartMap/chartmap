function reloadGapminderLayer(layername, keys) {
    
    var machtingLayers = new Array();
    var vectorLayer;
    var newURL;
    var newOptions;
    
    matchingLayers = map.getLayersByName(layername);
    if (matchingLayers.length == 1) {
        vectorLayer = matchingLayers[0];
    }
    else {
        console.log("getThematicStyleMap: Warning, " + matchingLayers.length + " layers found!");
        return;
    }
    
    newURL = "php/getJSON.php?keys=" + keys;
       
    var newOptions = {
        protocol: new OpenLayers.Protocol.HTTP({                
                url: newURL,
                format: new OpenLayers.Format.GeoJSON()
            })
    }
    
    //vectorLayer.addOptions(newOptions, false);
    //setting loaded to false unloads the layer//
    vectorLayer.loaded = false;
    //setting visibility to true forces a reload of the layer//
    vectorLayer.setVisibility(true);
    //the refresh will force it to get the new KML data//
    vectorLayer.refresh({ force: true, params: { 'keys': keys} });
    vectorLayer.protocol.url = newURL;
    vectorLayer.protocol.options.url = newURL;

}
/* Function getYearsByIndicator
 * Parameters:
 *      layername: string
 *      indicator: string
 * Returns a store which contains the available years of the given indicator
 */
function getYearsByIndicator(layername, indicator) {
    
    var matchingLayers;
    var vectorLayer;
    var yearStore;
    
    // get vector layer
    matchingLayers = map.getLayersByName(layername);
    if (matchingLayers.length == 1) {
        vectorLayer = matchingLayers[0];
    }
    else {
        console.log("getThematicStyleMap: Warning, the layer " + layername + " was not found!");
        return;
    }
    
    for (var i=0;i < vectorLayer.features.length;i++) {
        if (vectorLayer.features[i]['data'][indicator]) {
            // extract keys here!
        }
    }

    //build store containing the extracted keys
    
    //return the store
    return yearStore;
}
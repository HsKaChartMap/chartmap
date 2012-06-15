/* Function getYearsByIndicator
 * Parameters:
 * layername: string
 * indicator: string
 * Returns a store which contains the available years of the given indicator
 */
function getYearsByIndicator(layername, indicator) {
    
    var matchingLayers;
    var vectorLayer;
    var yearStore;
    var index = -1;
    var dates;
    
    // get vector layer
    matchingLayers = map.getLayersByName(layername);
    if (matchingLayers.length == 1) {
        vectorLayer = matchingLayers[0];
        dates = new Array();
    }
    else {
        console.log("getThematicStyleMap: Warning, the layer " + layername + " was not found!");
        return;
    }

    for (var i=0;i < vectorLayer.features.length;i++) {
        if (vectorLayer.features[i]['data'][indicator]) {
             //if (vectorLayer.features[i]['data'][indicator].length > 1) {
            var x = vectorLayer.features[i]['data'][indicator].length;
            for (var j=0; j < x; j++) {
                if (vectorLayer.features[i]['data'][indicator][j] != "") {
                    index = index + 1;
                    dates[index] = vectorLayer.features[i]['data'][indicator][j];
                }// end if
            }// enf for
        }// end if
    }// end for

    //build store containing the extracted keys
    yearStore = new Ext.data.SimpleStore({
        fields:['year'],
        data: dates
    });
    //return the store
    return yearStore;
}
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
    var yearsArray = new Array();
    var dates = new Array();
    
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
            for (var year in vectorLayer.features[i]['data'][indicator]) {
                if (yearsArray.indexOf(year) == -1) {
                    yearsArray.push(year);
                    dates.push([year, parseFloat(year)]);
                }
            }// enf for
        }// end if
    }// end for

    //build store containing the extracted keys
    yearStore = new Ext.data.SimpleStore({
        fields:['year', 'yearVal'],
        data: dates
    });
    //return the store
    return yearStore;
}
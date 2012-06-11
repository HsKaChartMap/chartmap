//Ext.require(['Ext.data.*']);


function generateData(){
    // get vector layer
    matchingLayers = map.getLayersByName("Staaten thematisch");
    if (matchingLayers.length == 1) {
        layer = matchingLayers[0];
    }
    else {
        console.log("getThematicStyleMap: Warning, the layer " + layername + " was not found!");
        return;
    }
    
    var data = new Array();
    var indicator = ['hdi', 'bla', 'blubb', 'aaaa', 'bbbb', 'cccc'];
            
    for (var i = 0; i < 6; i++) {
        data.push({
            angola: Math.random()*100,
            indicator: indicator[i]
        });
    }

    var store1 = Ext.create('Ext.data.JsonStore', {
        fields: ['angola', 'indicator'],
        data: data
    });
    return store1;
};
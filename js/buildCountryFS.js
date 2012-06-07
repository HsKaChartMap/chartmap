function buildCountryFS(layer){
    var featureStore;
    var fields = new Array();
    var field_x;
    var model;
    var features;
    
    if (layer.features.length > 0) {
        features = layer.features;
        
        // Schleife durch die Elemente des ersten Landes
        // Achtung: Es könnte sein, dass das erste Land nicht alle Indikatoren enthält
        // Lösung für die Erfassung aller Elemente suchen
        
        //for (var i = 0; i < features.length; i++) {#
            for (var property in  features[0].data) {
                
                // case 1: element has no properties / is NOT a gapminder indicator which has values for several years
                if (isEmpty(features[0].data[property])) {
                    field_x = {
                        name: property,
                        type: typeof features[0].data[property]
                    };
                    // add field
                    fields.push(field_x);
                }
                // case 2: element has properties / IS a gapminder indicator which has values for severals years
                else {
                    // loop through values for each year
                    for (var yearKey in features[0].data[property]) (function (property, yearKey) {              
                        field_x = {
                            name: property + "_" + yearKey,
                            type: typeof features[0].data[property][yearKey],
                            // assign convert function which returns the appropriate value
                            convert: function(v, record) {
                                if (features[0].data != null) {
                                    return valueToField(v, record, features[0].data[property][yearKey])
                                }
                                else {
                                    return 'FS Error';
                                }
                            }
                        }
                        // add field
                        fields.push(field_x);
                    })(property, yearKey);
                }
                
            }
        //}
        
        var model = Ext.define('countryFSModel', {
            extend: 'Ext.data.Model',
            fields: fields
        });

    }
    var featureStore = Ext.create('GeoExt.data.FeatureStore', {
        model: 'countryFSModel',
        layer: layer,
        featureFilter: new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.LESS_THAN,
            property: "country",
            value: "Belgium",
        }),
    });
    
    return featureStore;
}

    
// function which checks whether a element of an object has properties or not
function isEmpty(map) {
    for(var key in map) {
        if (map.hasOwnProperty(key) && key != "0") {
            return false;
        }
        return true;
    }
}

// convert function for a single gapminder value field
function valueToField(v, record, value){
    return parseFloat(value)*100;
}
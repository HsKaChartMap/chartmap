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
        
        //for (var i = 0; i < features.length; i++) {
            for (var property in  features[0].data) {
                
                if (isEmpty(features[0].data[property])) {
                    field_x = {
                        name: property,
                        type: typeof features[0].data[property]
                    };
                    fields.push(field_x);
                }
                else {
                
                    for (var yearKey in features[0].data[property]) {                    
                        field_x = {
                            name: property + "_" + yearKey,
                            type: typeof features[0].data[property][yearKey],
                            convert: valueToField
                        };
                        fields.push(field_x);
                    }
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
        layer: layer
    });
    
    return featureStore;
}

function isEmpty(map) {
    for(var key in map) {
        if (map.hasOwnProperty(key) && key != "0") {
            return false;
        }
        return true;
    }
}

function valueToField(v, record){
    return "val2Field return"
}
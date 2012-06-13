//Ext.require(['Ext.data.*']);


function generateData(){

    var data = new Array();
    var data1 = new Array();
    var countries = new Array();
    var indicator = ['hdi', 'bla', 'blubb', 'aaaa', 'bbbb', 'cccc'];
    var iRepCountry;
    var maxNumProperties;
    
    
    if (selectedFeatures.length > 0) {
        // find representative country and store its index in iRepCountry
        iRepCountry = 0;
        maxNumProperties = 0;
        for (var i = 0; i < selectedFeatures.length; i++) {
            countries.push(selectedFeatures[i].data.SOVEREIGNT);
            if (maxNumProperties < numProperties(selectedFeatures[i].data)) {
                maxNumProperties = numProperties(selectedFeatures[i].data);
                iRepCountry = i;
            }
        }
        
        for (var prop in selectedFeatures[iRepCountry].data) {
            if (!isEmpty(selectedFeatures[iRepCountry].data[prop])) {
                for(var year in selectedFeatures[iRepCountry].data[prop]) {
                    // initialize values array
                    var values = new Array();
                    //loop through countries and extract currenct ind_year combination
                    for (var i = 0; i < selectedFeatures.length; i++) {
                        console.log(selectedFeatures[i].data.SOVEREIGNT + ": " + prop + "_"  + year + " - " + selectedFeatures[i].data[prop][year]);
                        if (selectedFeatures[i].data[prop][year] == "-" || selectedFeatures[i].data[prop][year] == "") {
                            values.push(0);
                        }
                        else{
                            values.push(parseFloat(selectedFeatures[i].data[prop][year]));
                        }
                    }
                    data1.push({
                         indicator: prop + " " + year,
                         values: values
                    });
                }
            }
        }
    }
    
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

function isEmpty(map) {
    for(var key in map) {
        if (map.hasOwnProperty(key) && key != "0") {
            return false;
        }
        return true;
    }
}

function numProperties(object) {
    var e = 0;
    for(var key in object) {
        e++
    }
    return e;
}
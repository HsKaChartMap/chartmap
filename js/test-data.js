Ext.require(['Ext.data.*']);
/* daten holen */

var all_data;

function handler(request) {
    // you've got the response text
    //alert(request.responseText);
    // and don't forget you've got status codes
    //alert(request.status);
    // and of course you can get headers
    //alert(request.getAllResponseHeaders());
    all_data = JSON.parse(request.responseText);

    
}

var request = OpenLayers.Request.GET({
    //url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q,phAwcNAVuyj2tPLxKvvnNPA,phAwcNAVuyj0NpF2PTov2Cw",
    url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q",
    callback: handler
});

/* konfiguration */
var dataColumns = {'data2010':'2010', 'data2005':'2005'};

window.generateData = function(){
    var data = [];
    alert(all_data.features[1].properties.country);
    for (var i=0; i < all_data.features.length-174; i++) {
        var countryName = all_data.features[i].properties.country;
        var hdis = all_data.features[i].properties.HDI;
        var dataPoint = {land: countryName};

        for (var col in dataColumns) {
            var year = dataColumns[col];
            if (hdis != undefined && year in hdis) {
                dataPoint[col] =  100 * hdis[year];
            } else {
                dataPoint[col] = undefined;
            }
        }

        data.push(dataPoint);
    }

        /*for (var i=0; i < all_data.features.length-175; i++) {
            var countryName = all_data.features[i].properties.country;
            var hdis = all_data.features[i].properties.HDI;
            var dataPoint = {land: countryName};

            for (var col in dataColumns) {
                var year = dataColumns[col];
                if (hdis != undefined && year in hdis) {
                    dataPoint[col] =  100 * hdis[year];
                } else {
                    dataPoint[col] = undefined;
                }
            }

            data.push(dataPoint);
        }*/
        return data;
};

window.storedata = Ext.create('Ext.data.JsonStore', {
    fields: ['land'].concat(Object.keys(dataColumns)),
    data: generateData()
});



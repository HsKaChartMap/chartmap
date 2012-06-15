Ext.require([
    'GeoExt.data.*'
    ]);
Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);

NO_SCALING = function(v) { return v; }
SCALE_TIMES_100 = function(v) {return v*100; }

function showRadarChartDataFromURL(keys, indicators, year, countries) {
    var urlBegin = "http://localhost:8888/chartmap/php/getJSON.php?keys=";
    var urlKeys = keys.join();
    var url = urlBegin + urlKeys;

    console.log("Loading JSON at "+url);

    var httpRequest = new XMLHttpRequest();

    function dataAvailable(httpRequest){
        if (httpRequest.readyState == 4){
            if ((httpRequest.status == 200) || (httpRequest.status == 0)){
                console.log("got JSON data :-)");
                var all_data = JSON.parse(httpRequest.responseText);
                showRadarChart(all_data, indicators, year, countries);
            }else{
                alert('There was a problem with the request. ' + httpRequest.status + httpRequest.responseText);
            }
        }
    }
    httpRequest.onreadystatechange = function() { dataAvailable(httpRequest); };  
    httpRequest.open("GET", url, true);
    httpRequest.send(null);
}

function showRadarChart(all_data, indicators, year, countries){
    var storedata = Ext.create('Ext.data.JsonStore', {
        fields: ['indicator'].concat(countries),
        data: generateData(all_data, indicators, year, countries)
    });

    storedata.loadData(generateData(all_data, indicators, year, countries));

    var chart = Ext.create('Ext.chart.Chart', {
        width: 800,
        height: 600,
        animate: true,
        store: storedata,
        renderTo: Ext.getBody(),
        insetPadding: 20,
        theme: 'Category2',
        legend: {
            position: 'right'
        },
        axes: [{
            type: 'Radial',
            position: 'radial' ,
            label: {
                display: true,
            }
        }],
        series: generate_series(countries)
    });

    var win = Ext.create('Ext.window.Window', {
        width: 600,
        height: 450,
        minHeight: 400,
        minWidth: 550,
        hidden: false,
        shadow: true,
        maximizable: true,
        style: 'overflow: hidden;',
        title: 'Spider Test Chart Window',
        renderTo: Ext.getBody(),
        layout: 'fit',
        items: chart
    });
}

/******************************************************************************
 * CHART SETUP
 ******************************************************************************/
 function generateData(all_data, indicators, year, countries) {
    var data = [];
    var countryData = generate_country_data(all_data, Object.keys(indicators), year);
    for (var indicator in indicators) {
        var scale_fun = indicators[indicator];
        var dataPoint = { indicator:indicator };
        for (var j=0; j<countries.length; j++) {
            var country = countries[j];
            if (!(country in countryData)) {
                console.warn("No data for country '"+country+"'");
                continue;
            }
            var indicatorValue = countryData[country][indicator];

            dataPoint[country] = indicatorValue != undefined ? scale_fun(indicatorValue) : 0;
        }
        console.log("new datapoint: "+JSON.stringify(dataPoint));
        data.push(dataPoint);
    }

    return data;
};


/******************************************************************************
 * HELPER FUNCTIONS (SIDE-EFFECT FREE, SHOULD NOT NEED ANY GLOBALS)
 ******************************************************************************/

 /* generates the series for the chart */
 function generate_series(countries) {
    var series = [];

    for (var i=0; i < countries.length; i++) {
        series.push({
            showInLegend: true,
            type: 'radar',
            xField: 'indicator',
            yField: countries[i],
            style: {
                opacity: 0.4
            }
        });
    }

    return series;
}

/* generates a country -> indicator -> value map */
function generate_country_data(all_data, indicators, year) {
    var countryData = {};

    for (var i=0; i < all_data.features.length; i++) {
        var countryName = all_data.features[i].properties.country;
        var indicatorData = {};

        if (countryName == undefined) {
            continue;
        }

        for (var j=0; j<indicators.length; j++) {
            var indicator = indicators[j];
            if (indicator in all_data.features[i].properties) {
               indicatorData[indicator] = all_data.features[i].properties[indicator][year];
           } else {
               indicatorData[indicator] = 0;
               console.log("Country '"+countryName+"' has no indicator '"+indicator+"' for year "+year);
           }
       }

       countryData[countryName] = indicatorData;
   }

   return countryData;
}
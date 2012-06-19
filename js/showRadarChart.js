Ext.require([
    'GeoExt.data.*'
    ]);
Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);

function showRadarChartDataFromURL(keys, indicators, year, countries) {
    var urlBegin = "php/getJSON.php?keys=";
    var urlKeys = keys.join();
    var url = urlBegin + urlKeys;

    console.log("Loading JSON at "+url);

    var httpRequest = new XMLHttpRequest();

    function dataAvailable(httpRequest){
        if (httpRequest.readyState == 4){
            if ((httpRequest.status == 200) || (httpRequest.status == 0)){
                console.log("got JSON data :-)");
                var all_data = JSON.parse(httpRequest.responseText);    // writes the content of getJSON.php in all_data
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
    var radarStore = Ext.create('Ext.data.JsonStore', {
        fields: ['indicator'].concat(countries),                    // ['indicator', 'Germany', 'France', 'Portugal']
        data: generateData(all_data, indicators, year, countries)   // [{'indicator':'HDI','Germany':0.3,'France':7.9,'Portugal':2.9},{'indicator':'BIP', 'Germany':....}]
    });

    var multiSelectPanel = Ext.create('Ext.Panel', {
        title: 'Indikatoren',
        width: 200,
        region: 'west',
        items: [{
            xtype: 'multiselect',
            store: indComboBox.getStore(),
            displayField: 'displayName',
            valueField: 'indicatorName',
            ddReorder: true
        }]
    });
    
    var chart = Ext.create('Ext.chart.Chart', {
        region: 'center',
        id: 'ChartMap',
        xtype: 'chart',
        style: 'background:#fff',
        theme: 'Category3',
        width: 550,
        height: 400,
        insetPadding: 20,
        animate: true,
        store: radarStore,
        legend: {
            position: 'right'
        },
        axes: [{
            type: 'Radial',
            position: 'radial',
            label: {
                display: true
            }
        }],
        series: generate_series(countries)
    });
    
    var win = Ext.create('Ext.window.Window', {
        layout: 'border',
        width: 650,
        height: 450,
        minHeight: 400,
        minWidth: 550,
        hidden: false,
        shadow: true,
        maximizable: true,
        style: 'overflow: hidden;',
        title: 'Radar Chart',
        renderTo: Ext.getBody(),
        tbar: [{
            text: 'Reload Data',
            handler: function() {
                storedata.loadData(generateData(all_data, indicators, year, countries /* catch from checkboxes data here */));
            }
        }],
        items: [
            multiSelectPanel,
            chart
        ]
    });
}


function generateCheckboxes() {
    var checkboxes = new Array();
    var checkbox_x;
    
    indComboBox.getStore().each(function(record){
        checkboxes.push({ boxLabel: record.get("displayName"), name: 'rb', inputValue: '1'});
    });
    
    return checkboxes;
}


/******************************************************************************
 * CHART SETUP
 ******************************************************************************/
 function generateData(all_data, indicators, year, countries) {
    var data = [];
    var countryData = generate_country_data(all_data, Object.keys(indicators), year);
    /* countryData["Germany"]["HDI"] --> 0.98
       countryData["France"]["Infant mort rate"] --> 0.01
     */
    for (var indicator in indicators) {
        var scale_fun = indicators[indicator];          // gets value for key, which is scale function
        var dataPoint = { "indicator":indicator };      // creates map with key 'indicator' and e.g. value of 'hdi'
        // create maximum for countries / indicators
		var max = 0;
		for (var j=0; j<countries.length; j++) {
			var country = countries[j];
            if (!(country in countryData)) {
				console.warn("No data for country '"+country+"'");
                continue;
            }
			else {	// Set if higher
				if (max<countryData[country][indicator]) {
					max = countryData[country][indicator];
					}
			}
		}
		
		console.log("Indicator:" + indicator+ " Maximum:" + max);
        for (var j=0; j<countries.length; j++) {
            var country = countries[j];
            if (!(country in countryData)) {
                console.warn("No data for country '"+country+"'");
                continue;
            }
            var indicatorValue = countryData[country][indicator];       // picks the value on this position

            dataPoint[country] = indicatorValue != undefined ? scale_fun(indicatorValue) : 0; // applies the scale function to the value
        }
        console.log("new datapoint: "+JSON.stringify(dataPoint));
        data.push(dataPoint);   // adds the data point to the data array
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
            showMarkers: true,
            markerConfig: {
                radius: 5,
                size: 5
            },
            style: {
                'stroke-width': 2,
                fill: 'none'
                //opacity: 0.1
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
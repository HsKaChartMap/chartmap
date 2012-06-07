Ext.require([
    'GeoExt.data.*'
]);

function showRadarChart(){

/*
    matchingLayers = map.getLayersByName("Staaten thematisch");
    if (matchingLayers.length == 1) {
        vectorLayer = matchingLayers[0];
    }
    else {
        console.log("getThematicStyleMap: Warning, the layer was not found!");
        return;
    }
*/
    /*
    var featurestore = Ext.create('GeoExt.data.FeatureStore',{
        layer: vectorLayer,
        fields: [
            {name:'country'},
            //{name:'val1',mapping:'HDI.2010'}
        ],
        featureFilter: filtercountry,
        autoLoad:true
    });
    */

    var chart = Ext.create('Ext.chart.Chart', {
        id: 'chartCmp',
        xtype: 'chart',
        style: 'background:#fff',
        theme: 'Category3',
        insetPadding: 20,
        animate: true,
        store: countryFS,
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
        series: [{
            showInLegend: true,
            type: 'radar',
            yField: 'HDI_2010',
            xField: 'country',
            //yField: featureStore[0].properties[0].items[0],
            //xField: featureStore.data.items(1), var countryName = all_data.features[i].properties.country;
        //var hdis = all_data.features[i].properties.HDI;
        //var dataPoint = {land: countryName};

            showMarkers: false,
            markerConfig: {
                radius: 5,
                size: 5
            },
            style: {
                opacity: 0.4
            }
        }
        // ,{
        //     showInLegend: true,
        //     type: 'radar',
        //     yField: 'HDI_2010',
        //     xField: 'country',
        //     showMarkers: true,
        //     markerConfig: {
        //         radius: 5,
        //         size: 5
        //     },
        //     style: {
        //         opacity: 0.4
        //     }
        // }
        ]
    });

    var win = Ext.create('Ext.window.Window', {
        width: 200,
        height: 100,
        minHeight: 400,
        minWidth: 500,
        hidden: false,
        shadow: true,
        maximizable: true,
        style: 'overflow: hidden;',
        title: 'Spider Test Chart Window',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Test Button',
            enableToggle: false,
            handler: function(){
                alert("How to get data in here?");
            }
        }    
        ],
        items: chart
    });

}
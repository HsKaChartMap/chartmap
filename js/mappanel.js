Ext.require([
    'Ext.window.MessageBox',
    'Ext.container.Viewport',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
    'Ext.data.ResultSet',
    'GeoExt.panel.Map'
]);
       

Ext.application({
    name: 'HelloGeoExt2',
    launch: function() {

        Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider', {
            expires: new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days from now
        }));

        map = new OpenLayers.Map({});
        
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0?",
            {layers: 'basic'}
        );
        
        var topo = new OpenLayers.Layer.WMS(
            "Topographie", "http://gis.lmz-bw.de/tilecache/tilecache.py?", 
            {layers: 'bmng'}, {transitionEffect: 'null'}
        );

        // backgroundLayer
        var staatenAll = new OpenLayers.Layer.Vector("Staaten alle", {
            strategies: [new OpenLayers.Strategy.BBOX()],    
            projection: new OpenLayers.Projection("EPSG:4326"),
            protocol: new OpenLayers.Protocol.HTTP({                
                url: "data/staaten.json",
                format: new OpenLayers.Format.GeoJSON()
            })
        });
        
        // thematic Layer
        var staaten = new OpenLayers.Layer.Vector("Staaten thematisch", {
            strategies: [new OpenLayers.Strategy.BBOX()],    
            projection: new OpenLayers.Projection("EPSG:4326"),
            protocol: new OpenLayers.Protocol.HTTP({                
                //url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q,phAwcNAVuyj2tPLxKvvnNPA,phAwcNAVuyj0NpF2PTov2Cw,pyj6tScZqmEd1G8qI4GpZQg,rezAT4nYhKc2Loe6CxWSPWw",
                url: "php/getJSON.php",
                format: new OpenLayers.Format.GeoJSON()
            }),
            eventListeners: {
                'loadend': applyThematicStyle
            }
        });
        map.addLayers([topo,staatenAll,staaten]);
        
        // FeatureStore
        //countryFS = buildCountryFS(staaten);
        
        
        // START styling
        // create Style Object for the background layer
        var backgroundStyle= new OpenLayers.Style({
            strokeColor:'#ffffff',
            strokeOpacity:0.5,
            fillColor: '#999999',
            fillOpacity: 0.5
        });
        
        // create StyleMap-Object for the background layer
        var backgroundStyleMap = new OpenLayers.StyleMap(
            {
            'default': backgroundStyle
            }
        );
        staatenAll.addOptions({
            styleMap: backgroundStyleMap
        });
        
        // function as eventhandler of loadend-event
        function applyThematicStyle() {
            
            // create StyleMap-Object for the thematic layer
            thematicStyleMap = new OpenLayers.StyleMap(
                {
                'default': getThematicStyle("Staaten thematisch")
                }
            );
            staaten.addOptions({
                styleMap: thematicStyleMap
            });
            // redraw
            staaten.redraw();
            
            // Rebuild countryFeatureStore
            countryFS = buildCountryFS(staaten);
            console.log("Neuer FeatureStore wurde erstellt");
        }
        // END styling
        
        // START GUI
        // START toolbar items
        var chartButton = new Ext.Button({
                xtype: 'button',
                   text: '',
                iconCls: 'spider',
                scale: 'large',
                tooltip: "Zeige Radar-Diagramm",
        });
        
		var mapButton = new Ext.Button({
                xtype: 'button',
                   text: '',
                iconCls: 'mapbutton',
                scale: 'large',
                tooltip: "Zeige thematische Karte",
        });
		
		
        // Indicator ComboBox
        Ext.define('indicatorModel', {
            extend: 'Ext.data.Model',
            fields: ['key', 'displayName', 'indicatorName', 'category', 'subcategory', 'dataprovider', 'dataprovider_link']
        });

        var indicatorStore = Ext.create('Ext.data.Store', {
            model: 'indicatorModel',
            proxy: {
                type: 'ajax',
                url : 'data/indicators.json',
                reader: {
                    type: 'json'
                }
            },
            autoLoad: true,
            sorters: [{
                 property: 'indicatorName',
                 direction: 'ASC'
             }]
        });

        // ComboBox to choose the indicator for the classification
        indComboBox = Ext.create('Ext.form.ComboBox', {
             width: 400,
             fieldLabel: 'Indikator',
             labelWidth: 65,
             store: indicatorStore,
             queryMode: 'local',
             displayField: 'displayName',
             valueField: 'indicatorName',
             triggerAction: 'all',
             multiSelect: false, // future: true
             listeners: {
                select: function(combobox, records, options) {
                    var keystring = ""
                    for (i = 0; i < records.length; i++) {
                        
                        keystring = keystring + records[i].data.key;
                        if (i != records.length-1) {
                            keystring += ',';
                        }
                    }
                    reloadGapminderLayer("Staaten thematisch", keystring);
                }
             }
        });
        
        // ComboBox to choose the year for the classification
        yearComboBox = Ext.create('Ext.form.ComboBox', {
             width: 120,
             fieldLabel: 'Jahr',
             labelWidth: 35,
             store: ['2005', '2006', '2007', '2008', '2009', '2010'],
             queryMode: 'local',
             value: '2010',
             triggerAction: 'all',
             listeners: {
                select: function() {
                    applyThematicStyle()
                }
             }
        });
        
        // ComboBox to choose the type of classification
        var clTypeStore = new Ext.data.SimpleStore({
        	fields:['name', 'value'],
        	data: [ ['Quantile', 'quantiles'],
        			['Gleiche Intervalle', 'eqinterval'],
                    ['Natürliche Unterbrechungen','jenks']
                  ]
        });
        clTypeComboBox = Ext.create('Ext.form.ComboBox', {
             width: 260,
             fieldLabel: 'Klassifizierung',
             labelWidth: 75,
             store: clTypeStore,
             displayField: 'name',
             valueField: 'value',
             value: 'quantiles',
             queryMode: 'local',
             triggerAction: 'all',
             listeners: {
                select: function() {
                    applyThematicStyle()
                }
             }
        });
        
        // ComboBox to choose the number of classes for the classification
        clComboBox = Ext.create('Ext.form.ComboBox', {
             width: 100,
             fieldLabel: 'Klassen',
             labelWidth: 45,
             store: [6],
             queryMode: 'local',
             value: '6',
             triggerAction: 'all'
        });
        // END toolbar items
        
        // START panels
        // MapPanel
        var mappanel = Ext.create('GeoExt.panel.Map', {
        region: 'center',
        id: "mappanel",
        xtype: "gx_mappanel", // TabPanel itself has no title
        layers: [topo,staatenAll,staaten],
        map: map,
        center: '0,0',
        zoom: 3,
        activeTab: 0,      // First tab active by default
        items: {
            tbar: [
                chartButton,
                { xtype: 'tbspacer', width: 10 },
                indComboBox,
                { xtype: 'tbspacer', width: 20 },
                yearComboBox,
                { xtype: 'tbspacer', width: 20 },
                clTypeComboBox,
                { xtype: 'tbspacer', width: 20 },
                clComboBox,
				{ xtype: 'tbspacer', width: 20 },
				mapButton
            ]
            }
        });
        
        // LegendPanel
        var legendPanel = Ext.create('GeoExt.panel.Legend', {
            //title: "Legend",
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px'
            },
            bodyStyle: 'padding:5px',
            width: 350,
            autoScroll: true,
        });
        
        // Viewport
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(),
            items: [
                {
                    region: 'east',
                    title: 'Legende',
                    items: [legendPanel],
                    collapsible: true,
                    collapsed:true,
                    split: true,
                    width: 150
                },
                mappanel
            ]
        });
        //END panels
        // END GUI
    }
});


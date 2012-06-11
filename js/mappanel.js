Ext.require([
    'Ext.window.MessageBox',
    'Ext.container.Viewport',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
    'Ext.data.ResultSet',
    'GeoExt.panel.Map',
    'GeoExt.panel.Legend',
    'GeoExt.container.VectorLegend',
    'GeoExt.Action'
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
        /*TopoLayer
        var topo = new OpenLayers.Layer.WMS(
            "Topographie", "http://gis.lmz-bw.de/tilecache/tilecache.py?", 
            {layers: 'bmng'}, {transitionEffect: 'null'}
        );
		*/
		
        // BackgroundLayer
        var staatenAll = new OpenLayers.Layer.Vector("Staaten alle", {
            strategies: [new OpenLayers.Strategy.BBOX()],    
            projection: new OpenLayers.Projection("EPSG:4326"),
			isBaseLayer: true,
            protocol: new OpenLayers.Protocol.HTTP({                
                url: "data/staaten.json",
                format: new OpenLayers.Format.GeoJSON()
            })
        });
        
        // Thematic Layer
        var staaten = new OpenLayers.Layer.Vector("Staaten thematisch", {
            strategies: [new OpenLayers.Strategy.Fixed()],    
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
		//Add Layers to map
       // map.addLayers([staatenAll,staaten]);
        
        // FeatureStore
        //countryFS = buildCountryFS(staaten);
        
        
        // START styling
        // create Style Object for the background layer
        var backgroundStyle= new OpenLayers.Style({
            strokeColor:'#ffffff',
            strokeOpacity:1,
            fillColor: '#BDBDBD',
            fillOpacity: 1
			
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

        // Function as eventhandler of loadend-event
        function applyThematicStyle() {
        
            console.log("applyThematicStyle: loadend wurde ausgelöst");
            
            // Create StyleMap-Object for the thematic layer
            thematicStyleMap = new OpenLayers.StyleMap(
                {
                'default': getThematicStyle("Staaten thematisch")
                }
            );
            staaten.addOptions({
                styleMap: thematicStyleMap
            });
            // Redraw staaten layer
            staaten.redraw();
            console.log("applyThematicStyle: Layer wurde neu gezeichnet");
            
            // Update vectorLegend
            vectorLegend.setRules();
            vectorLegend.update();
            
            // Rebuild countryFeatureStore
            countryFS = buildCountryFS(staaten);
            console.log("applyThematicStyle: Neuer FeatureStore wurde erstellt");
        }
        // END styling
        
        // START GUI
        // START toolbar items
		var ctrl, toolbarItems = [], action, actions = {};
	
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
             width: 200,
             //fieldLabel: 'Indikator',
			 editable: false,
			 emptyText: 'Indikator wählen',
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
        toolbarItems.push(indComboBox);
        toolbarItems.push({ xtype: 'tbspacer', width: 10 });
        
        // ComboBox to choose the year for the classification
        yearComboBox = Ext.create('Ext.form.ComboBox', {
			 emptyText: 'Jahr wählen',
			 editable: false,
             width: 100,
             //fieldLabel: 'Jahr',
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
        toolbarItems.push(yearComboBox);
        toolbarItems.push({ xtype: 'tbspacer', width: 10 });
        
        // ComboBox to choose the type of classification
        var clTypeStore = new Ext.data.SimpleStore({
        	fields:['name', 'value'],
        	data: [ ['Quantile', 'quantiles'],
        			['Gleiche Intervalle', 'eqinterval'],
                    ['Natürliche Unterbrechungen','jenks']
                  ]
        });
        clTypeComboBox = Ext.create('Ext.form.ComboBox', { 
			 emptyText: 'Klassifizierung wählen',
			 width: 200,
             //fieldLabel: 'Klassifizierung',
             labelWidth: 75,
             store: clTypeStore,
			 editable: false,
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
        toolbarItems.push(clTypeComboBox);
        toolbarItems.push({ xtype: 'tbspacer', width: 10 });
        
        // ComboBox to choose the number of classes for the classification
        clComboBox = Ext.create('Ext.form.ComboBox', {
             width: 100,
			 editable: false,
             fieldLabel: 'Klassen',
             labelWidth: 45,
             store: [3, 4, 5, 6],
             queryMode: 'local',
             value: '6',
             triggerAction: 'all',
             listeners: {
                select: function() {
                    applyThematicStyle()
                }
             }
        });
        toolbarItems.push(clComboBox);
        toolbarItems.push({ xtype: 'tbspacer', width: 10 });
        
        //Actions for toolbar
        
        // ZoomToMaxExtent control, a "button" control
         extentaction = Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text: "",
			iconCls: 'mapbutton',
			scale: 'large',
            tooltip: "Zeige Karte in maximaler Ausdehnung"
        });
        actions["max_extent"] = extentaction;
        toolbarItems.push(Ext.create('Ext.button.Button', extentaction));
        toolbarItems.push("-");
		
		// SelectFeature control, a "button" control
		action = Ext.create('GeoExt.Action', {
            text: "",
			iconCls: 'select',
			scale: 'large',
            control: new OpenLayers.Control.SelectFeature(staaten, {
                type: OpenLayers.Control.TYPE_TOGGLE,
				multiple: false,
			
				onSelect: function(){ 
					var popup = {
					xtype: 'gx_popup',
					title: "My Popup",
					location: feature,
					width: 200,
					html: "Popup content",
					collapsible: true,
					map:map
					}
					popup.show();
				//popupfunktion()
				},
				
				clickout: true
				
            }),
			
            map: map,
			
            // button options
            enableToggle: true,
			
			//listeners: {"featurehighlighted": new function(){alert("test2")}},
			
            tooltip: "Land auswählen"
        });

		function popupfunktion(){
		var popup = new OpenLayers.Popup("chicken",
                       new OpenLayers.LonLat(5,40),
                       new OpenLayers.Size(100,30),
                       "Äthiopien",
                       true);
		
		map.addPopup(popup);
		}

		var chartButton = new Ext.Button({
                xtype: 'button',
                text: '',
                iconCls: 'spider',
                scale: 'large',
                tooltip: "Zeige Radar-Diagramm",
        });
        toolbarItems.push(chartButton);
		toolbarItems.push("-");
		
		var report = function(e) {
                OpenLayers.Console.log(e.type, e.feature.id);
            };
			
        actions["select"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("-");
        
        // END toolbar items
        
        // START panels
        // MapPanel
        var mappanel = Ext.create('GeoExt.panel.Map', {
        region: 'center',
        id: "mappanel",
        xtype: "gx_mappanel", // TabPanel itself has no title
        layers: [staatenAll,staaten],
        map: map,
        center: '0,0',
		extent: '5.19,46.85,15.47,55.63',
        zoom: 3,
        activeTab: 0,      // First tab active by default
        dockedItems: [{
                xtype: 'toolbar',
                //dock: 'top',
                items: toolbarItems
            }]
        });
		
        vectorLegend = Ext.create('GeoExt.container.VectorLegend', {
            legendTitle: 'Thematische Karte',
            layer: staaten
            //labelCls: 'vectorLegendItem' // todo: Create CSS class to show nice items
        });
		
        // LegendPanel
        var legendPanel = Ext.create('Ext.Panel', {
            title: "Legende",
            region: 'west',
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px'
            },
            bodyStyle: 'padding:5px',
            collapsible: true,
            collapsed: true,
            split: true,
            width: 200,
            autoScroll: true,
            items: [vectorLegend]
        });
        
        // Viewport
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(),
            items: [
                legendPanel,
                mappanel
            ]
        });
        //END panels
        // END GUI
    }
});


        
        

Ext.require([
    'Ext.window.MessageBox',
    'Ext.container.Viewport',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
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
                //url: "data/staaten.json",
                url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q,phAwcNAVuyj2tPLxKvvnNPA,phAwcNAVuyj0NpF2PTov2Cw,pyj6tScZqmEd1G8qI4GpZQg,rezAT4nYhKc2Loe6CxWSPWw",
                format: new OpenLayers.Format.GeoJSON()
            }),
            eventListeners: {
                'loadend': applyThematicStyle
            }
        });
        map.addLayers([topo,staatenAll,staaten]);
        
        
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
            
            // todo: hard coded colors
            var thematicColors = new Array('#FFC6A5', '#FF9473', '#FF6342', '#FF3118', '#FF0000', '#AD0000')
            
            // create StyleMap-Object for the thematic layer
            thematicStyleMap = new OpenLayers.StyleMap(
                {
                'default': getThematicStyle("Staaten thematisch", 'HDI', 2010, 'quantiles', 6, thematicColors)
                }
            );
            staaten.addOptions({
                styleMap: thematicStyleMap
            });
            // redraw
            staaten.redraw();
        }
        // END styling
        
        // START GUI
        // toolbar items
        var alertButton = new Ext.Button({
            text: 'Alert Button',
            enableToggle: false,
            handler: function(){
            alert("Alert");
            }    
        });
        
        var toggleButton = new Ext.Button({
            text: 'Toggle Button',
            enableToggle: true,
            visible: false,
        
        });
        
        var picButton = new Ext.Button({
                xtype: 'button',
                   text: '',
                iconCls: 'spider',
                scale: 'large',
                tooltip: "Show Radar-Chart",
        });
        
        var indmenu = new Ext.Button({
        xtype: 'menu',
        text: 'Indicators',
        tooltip: "Select Indicator",
        menu: [{
        text: 'HDI'},{text: 'BNE'},{text: 'GDP'},{text: 'Nr.4'},{text: 'Nr.5'},{text: 'Nr.6'},{text: 'Nr.7'},{text: 'Nr.8'},{text: 'Nr.9'},{text: 'Nr.10'},{
        text: 'Nr.11'},{text: 'Nr.12'},{text: 'Nr.13'},{text: 'Nr.14'},{text: 'Nr.15'},{text: 'Nr.16'},{text: 'Nr.17'},{text: 'Nr.18'},{
        }]
        });
        
        // End toolbar items
        
        var mappanel = Ext.create('GeoExt.panel.Map', {
            
        region: 'center',
		id: "mappanel",
        xtype: "gx_mappanel", // TabPanel itself has no title
		layers: [topo,staatenAll,staaten],
		map: map,
		center: '12.3046875,51.48193359375',
        zoom: 3,
        activeTab: 0,      // First tab active by default
        items: {
            title: 'Thematische Karte',
            tbar: [alertButton, toggleButton, picButton, indmenu]
			}
        });
		
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
        
        

       Ext.create('Ext.container.Viewport', {
		layout: 'border',
		renderTo: Ext.getBody(),
		items: [{
			region: 'east',
			title: 'Legende',
			items: [legendPanel],
			collapsible: true,
			collapsed:true,
			split: true,
			width: 150
			}, mappanel
			]
		});
        // END GUI
    }
});


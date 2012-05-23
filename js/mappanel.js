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

        var map = new OpenLayers.Map({});
        
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0?",
            {layers: 'basic'}
        );
		
		var topo = new OpenLayers.Layer.WMS(
			"Topographie", "http://gis.lmz-bw.de/tilecache/tilecache.py?", 
			{layers: 'bmng'}, {transitionEffect: 'null'}
		);
		
		var backgroundStyle= new OpenLayers.Style({
			strokeColor:'#ffffff',
			strokeOpacity:0.5,
			fillColor: '#999999',
			fillOpacity: 0.5
			});
		
		
		//creating StyleMap Objects with Styles for background and thematic layer
		var backmapObj = new OpenLayers.StyleMap(
			{
			'default': backgroundStyle
			}
		);
		
		var stylemapObj = new OpenLayers.StyleMap(
			{
			'default': getThematicStyle(new Array(), 6) // getThematicStyle(data, anzKlassen)
			}
		);
		
		//backgroundLayer
		var staatenAll = new OpenLayers.Layer.Vector("StaatenAll", {
				styleMap: backmapObj,
       			strategies: [new OpenLayers.Strategy.BBOX()],	
			projection: new OpenLayers.Projection("EPSG:4326"),
        		protocol: new OpenLayers.Protocol.HTTP({				
						url: "data/staaten.json",
						format: new OpenLayers.Format.GeoJSON()
	    		})
		});
		
		//thematic Layer
		var staaten = new OpenLayers.Layer.Vector("Staaten", {
				//adding Stylemap to our VectorLayer "Staaten"
				styleMap:stylemapObj,
       			strategies: [new OpenLayers.Strategy.BBOX()],	
			projection: new OpenLayers.Projection("EPSG:4326"),
        		protocol: new OpenLayers.Protocol.HTTP({				
						//url: "data/staaten.json",
						url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q",
						format: new OpenLayers.Format.GeoJSON()
	    		})
		});
		


        map.addLayers([topo,staatenAll,staaten]);
 
		
		
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
		
        mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'MapPanel',
            map: map,
            center: '12.3046875,51.48193359375',
            zoom: 6,
            stateful: true,
            stateId: 'mappanel',

            dockedItems: [{
                dock: 'top',
                items: [{
					bbar: new Ext.Toolbar({
						items: [alertButton, toggleButton, picButton, indmenu]
				})
			}]
            }]
        });
		
		

        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                mappanel
            ]
        });
    }
});


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
		
		
		var staaten = new OpenLayers.Layer.Vector("Staaten", {
       			strategies: [new OpenLayers.Strategy.BBOX()],	
			projection: new OpenLayers.Projection("EPSG:4326"),
        		protocol: new OpenLayers.Protocol.HTTP({				
						url: "php/getJSON.php?keys=tyadrylIpQ1K_iHP407374Q",
						format: new OpenLayers.Format.GeoJSON()
	    		})
		});
		
        
        map.addLayers([topo,staaten]);
        
        mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'MapPanel',
            map: map,
            center: '12.3046875,51.48193359375',
            zoom: 6,
            stateful: true,
            stateId: 'mappanel',
//            extent: '12.87,52.35,13.96,52.66',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Center?',
                    handler: function(){
                        var c = GeoExt.panel.Map.guess().map.getCenter();
                        Ext.Msg.alert(this.getText(), c.toString());
                    }
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

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
        map.addLayers([staatenAll,staaten]);
        
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
        
            console.log("applyThematicStyle: loadend wurde ausgelÃ¶st");
            
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
            countryFS.unbind();
            
            //console.log("applyThematicStyle: Neuer FeatureStore wurde erstellt");
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
                    staaten.removeAllFeatures();
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
                    ['NatÃ¼rliche Unterbrechungen','jenks']
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
                clickout: true,
                toggle:true,
                multiple: true,
                box: false,
                //onSelect: onFeatureSelect,
               onSelect:featureSelected,
            }),
            map: map,
            // button options
            enableToggle: true,          
            //listeners: {"featurehighlighted": new function(){alert("test2")}},
            tooltip: "Land auswÃ¤hlen"
        });
        
       
//Romans Datenzugriff        
        function featureSelected(feature){ 
           console.log("select", feature.data.SOVEREIGNT);
        }
 //       

staaten.events.on({
        "featurehighlighted": function(e) {
            onFeatureSelect(e.feature);
            }
        });
 
        function onFeatureSelect(feature) {
        selectedFeature = feature;
        popup = new OpenLayers.Popup("",
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(120,20),
            '<b>Land:</b>&nbsp;'+feature.data.SOVEREIGNT,            
            //<div style='padding:15px 5px 5px 10px;'>"Name"+ test </div>,
            null,
            false,
            onPopupClose);
        feature.popup = popup;
        map.addPopup(popup);
        }

        function onPopupClose(e) {
        selectControl.unselect(selectedFeature);
        }
        
        function onFeatureUnselect(feature) {
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
        }

        var selectControl = new OpenLayers.Control.SelectFeature(staaten,{
        hover: true, 
        highlightOnly: false,
        renderIntent: "temporary",
        overFeature:onFeatureSelect,
        outFeature:onFeatureUnselect,
        onUnselect:onFeatureUnselect
        }); 

        map.addControl(selectControl);
        selectControl.activate();
       

        
        var chartButton = new Ext.Button({
                xtype: 'button',
                text: '',
                iconCls: 'spider',
                scale: 'large',
                tooltip: "Zeige Radar-Diagramm",
                handler: function(){
                    alert('You clicked the button!');
                    showRadarChart();
                }
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

         var impressumPanel = Ext.create('Ext.Panel', {
            title: 'Impressum',
            collapsible: true,
            collapsed: true,
            html:'<br><h2>&nbsp;Hochschule Karlsruhe</h2> <br><b>&nbsp;GIS-Projekt</b><br> &nbsp;Alice Rühl<br> &nbsp;Amr Bakri <br> &nbsp;Michael Kuch<br> &nbsp;Roman Wössner<br><br><img src="img/lmz.gif"><br><br>'
         });
        
        var hilfePanel = Ext.create('Ext.Panel', {
            title: 'Hilfe',
            collapsible: true,
            collapsed: true,
            html:'<br>Wähle das Thema (Indikator) deiner Karte, die Jahreszahl sowie die Klassifizierungsart und Anzahl der Klassen in den obigen Auswahlmenüs aus. Sobald deine Wahl abgeschlossen is, wird automatisch die Karte angezeigt.<br><br><b>Bedeutung der Buttons</b><br><br><img src="img/mapbutton.png"> Kartenübersicht <br> <br><img src="img/select.png">&nbsp;Länderwahl<br><br><img src="img/spider.png">&nbsp;Diagramm<br><br>' 
         });
        

        // LegendPanel
        var legendPanel = Ext.create('Ext.Panel', {
            title: "Legende",
           // region: 'west',
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px; background-color: #EAEAEA;',   
            },
            collapsible: true,
            collapsed: false,    
            //split: true,
            //width: 200,
            autoScroll: true,
            items: [vectorLegend]
        });
        
        var menuPanel = Ext.create('Ext.Panel', {
            title: "",
            region: 'west',
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px; background-color: #EAEAEA;',   
            },
            
            collapsible: false,
            collapsed: false,    
            split: true,
            width: 200,
            autoScroll: true,
            items: [legendPanel,hilfePanel,impressumPanel]
        });
        
        // Viewport
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(), 
            items: [
                menuPanel,
                mappanel
            ]
        });
        //END panels
        // END GUI
    }
});

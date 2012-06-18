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
    name: 'Chart Map Application',
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
                url: "php/getJSON.php",
                format: new OpenLayers.Format.GeoJSON()
            }),
            eventListeners: {
                'loadend': applyThematicStyle
            }
        });

        //Add Layers to map
        map.addLayers([staatenAll,staaten]);

        var scaleline = new OpenLayers.Control.ScaleLine();
        map.addControl(scaleline);
        
        /* START STYLING */
        // create Style Object for the background layer
        var backgroundStyle = new OpenLayers.Style({
            strokeColor:'#ffffff',
            strokeOpacity:1,
            fillColor: '#BDBDBD',
            fillOpacity: 1
        });

        // create StyleMap-Object for the background layer
        var backgroundStyleMap = new OpenLayers.StyleMap({
            'default': backgroundStyle
        });
        staatenAll.addOptions({
            styleMap: backgroundStyleMap
        });

        // Function as eventhandler of loadend-event
        function applyThematicStyle() {
            console.log("applyThematicStyle: loadend wurde ausgelöst");

            // Create StyleMap-Object for the thematic layer
            thematicStyleMap = new OpenLayers.StyleMap({
                'default': getThematicStyle("Staaten thematisch")
            });
            staaten.addOptions({
                styleMap: thematicStyleMap
            });
            // Redraw staaten layer
            staaten.redraw();
            console.log("applyThematicStyle: Layer wurde neu gezeichnet");

            // Update YearComboBox
            yearComboBox.bindStore(getYearsByIndicator("Staaten thematisch", indComboBox.getValue()));
            yearComboBox.select(yearComboBox.getStore().data.items[0])
            
            // Update vectorLegend
            vectorLegend.setRules();
            vectorLegend.update();
            
        }
        /* END STYLING */

        /* START GUI */
        // START toolbar items
        var ctrl, toolbarItems = [], action, actions = {};

        // Set up a store for all indicator metadata
        Ext.define('indicatorModel', {
            extend: 'Ext.data.Model',
            fields: ['key', 'displayName', 'indicatorName', 'category', 'subcategory', 'dataprovider', 'dataprovider_link', 'scale_function']
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
            editable: false,
            emptyText: 'Indikator wählen',
            labelWidth: 65,
            store: indicatorStore,
            queryMode: 'local',
            displayField: 'displayName',
            valueField: 'indicatorName',
            triggerAction: 'all',
            multiSelect: true,
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
        
        
        var yearStore = new Ext.data.SimpleStore({
            fields:['year', 'yearVal'],
            data: [ ['2010', '2010'],
            ['2011', '2011'],
            ['2012', '2012']
            ]
        });
        
        // ComboBox to choose the year for the classification
        yearComboBox = Ext.create('Ext.form.ComboBox', {
            emptyText: 'Jahr wählen',
            editable: false,
            width: 75,
            labelWidth: 35,
            store: yearStore,
            queryMode: 'local',
            displayField: 'year',
            valueField: 'yearVal',
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

        // ComboBox to choose the number of classes for the classification
        farbComboBox = Ext.create('Ext.form.ComboBox', {
            width: 100,
            editable: false,
            fieldLabel: 'Farbe',
            labelWidth: 45,
            store: ['rot', 'grün', 'blau', 'lila','orange'],
            queryMode: 'local',
            value: 'rot',
            triggerAction: 'all',
            listeners: {
                select: function() {
                    applyThematicStyle()
                }
            }
        });

        toolbarItems.push(farbComboBox);
        toolbarItems.push({ xtype: 'tbspacer', width: 10 });
        toolbarItems.push("-");

        /* Actions for toolbar */
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
                onSelect: featureSelected,
                onUnselect: featureUnselected
            }),
            map: map,
            // button options
            enableToggle: true,          
            //listeners: {"featurehighlighted": new function(){alert("test2")}},
            tooltip: "Land auswählen"
        });

        /* featureSelected        
        * pushed a selected feature to the selectedFeatures array
        */
        function featureSelected(feature){ 
            selectedFeatures.push(feature);
        }

        /* featureUnselected
        * removed a unselected feature from the selectedFeatures array
        */
        function featureUnselected(feature){
            for (var i = 0; i < selectedFeatures.length; i++) {
                if (selectedFeatures[i].data.SOVEREIGNT == feature.data.SOVEREIGNT) {
                    selectedFeatures.splice(i, 1);
                }
                else {
                    console.log("featureUnselected: Unselected feature '" + feature.data.SOVEREIGNT + "' not found!");
                }
            }
        }

        //Popup and Mouseovereffect
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
            overFeature:onFeatureSelect,
            outFeature:onFeatureUnselect,
            onUnselect:onFeatureUnselect
        }); 
        map.addControl(selectControl);
        selectControl.activate();

        //Mouseover
        var hoverControl = new OpenLayers.Control.SelectFeature(staaten,{
            hover: true,
            highlightOnly: true,
            renderIntent: "temporary",
        }); 
        map.addControl(hoverControl);
        hoverControl.activate();       
        // End popup and Mouseovereffect      

        actions["select"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("-");


        var chartButton = new Ext.Button({
            xtype: 'button',
            text: '',
            iconCls: 'spider',
            scale: 'large',
            tooltip: "Zeige Radar-Diagramm",
            handler: function(){
                /* INDICATOR */
                var g_keys = [];
                var g_indicators = {};

                var indicats = indComboBox.getValue();

                indicatorStore.queryBy(function(record, id) {
                    //console.log(record.get("indicatorName")+"   "+indicats.indexOf(record.get("indicatorName")));
                    return indicats.indexOf(record.get("indicatorName")) != -1;
                }).each(function(record) { 
                    g_keys.push(record.get("key")); 
                    g_indicators[record.get("indicatorName")]=scale_funs[record.get("scale_function")];
                });

                if (indicats === null) {
                    alert("Bitte zuerst Indikator wählen");
                    return;
                }

                var g_year = yearComboBox.getValue();

                var g_countries = [];
                var selFeatures = staaten.selectedFeatures;
                for (var i=0; i<selFeatures.length; i++) {
                    var country = selFeatures[i].attributes.SOVEREIGNT
                    if (country.indexOf(".") != -1) {
                        alert("Die ExtJS Chart Legende scheint ein Problem zu haben, wenn ein Punkt im Namen auftaucht. Daher kann '"+country+"' nicht verwendet werden.");
                    } else {
                        g_countries.push(country);
                    }
                }
                console.log("selected countries: " + g_countries);

                if (g_countries.length < 1 || g_countries.length > 5) {
                    alert("Bitte wählen Sie mindestens 1, aber maximal 5 Länder aus!");
                    return;
                }

                showRadarChartDataFromURL(g_keys, g_indicators, g_year, g_countries);
            }
        });

        toolbarItems.push(chartButton);

        // WAS TUT DAS?
        var report = function(e) {
            OpenLayers.Console.log(e.type, e.feature.id);
        };

        // END toolbar items
        
        /* START panels */
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
            html:'<br><h2>&nbsp;Hochschule Karlsruhe</h2><br><b>&nbsp;GIS-Projekt</b><br> &nbsp;Alice Rühl<br> &nbsp;Amr Bakri<br> &nbsp;Michael Kuch<br> &nbsp;Roman Wössner<br><br><img src="img/lmz.gif"><br><br>'
        });
        
        var hilfePanel = Ext.create('Ext.Panel', {
            title: 'Hilfe',
            collapsible: true,
            collapsed: true,
            html:'<br>Wähle das Thema (Indikator) deiner Karte, die Jahreszahl sowie die Klassifizierungsart und Anzahl der Klassen in den obigen Auswahlmenüs aus. Sobald deine Wahl abgeschlossen is, wird automatisch die Karte angezeigt.<br><br><b>Bedeutung der Buttons</b><br><br><img src="img/mapbutton.png"> Kartenübersicht <br><br><img src="img/select.png">&nbsp;Länderwahl <br><br><img src="img/spider.png">&nbsp;Diagramm<br><br>'
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
        /* END GUI */
    }
});

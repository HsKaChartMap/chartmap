Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);

Ext.onReady(function () {
    storedata.loadData(generateData());

    var chart = Ext.create('Ext.chart.Chart', {
            id: 'chartCmp',
            xtype: 'chart',
            style: 'background:#fff',
            theme: 'Category3',
            insetPadding: 20,
            animate: true,
            store: storedata,
            legend: {
                position: 'right'
            },
            axes: [{
                type: 'Radial',
                position: 'radial',
                label: {
                    display: false
                }
            }],
            series: [{
                showInLegend: true,
                type: 'radar',
                xField: 'land',
                yField: 'data2010',
                style: {
                    opacity: 0.4
                }
            },
            {
                showInLegend: true,
                type: 'radar',
                xField: 'land',
                yField: 'data2005',
                style: {
                    opacity: 0.4
                }
            }]
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
        tbar: [{
            text: 'Reload Data',
            handler: function() {
                storedata.loadData(generateData());
            }
        }, {
            enableToggle: true,
            pressed: true,
            text: 'Animate',
            toggleHandler: function(btn, pressed) {
                var chart = Ext.getCmp('chartCmp');
                chart.animate = pressed ? { easing: 'ease', duration: 500 } : false;
            }
        }, {
            text: 'Test Button',
            enableToggle: false,
            handler: function(){
                alert("just an alert");
            }
        }    
        ],
        items: chart
    });
});
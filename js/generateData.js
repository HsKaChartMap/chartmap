Ext.require(['Ext.data.*']);


function generateData(layer){
    
    var data = new Array();
            
    for (var i = 0; i < layer.features.length; i++) {
        data.push({
            country: layer.features[i].data[i],
            data1: Math.random() * 100,
            data2: Math.random() * 100,
            data3: Math.random() * 100,
            data4: Math.random() * 100,
            data5: Math.random() * 100,
            data6: Math.random() * 100,
            data7: Math.random() * 100,
            data8: Math.random() * 100,
            data9: Math.random() * 100,
        });
    }
    return data;
};
var store1 = Ext.create('Ext.data.JsonStore', {
    fields: ['country', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data9', 'data9'],
    data: generateData()
});

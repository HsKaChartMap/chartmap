Ext.require(['Ext.data.*']);

Ext.onReady(function() {

    window.generateData = function(n, floor){
        var data = [],
            p = (Math.random() *  11) + 1,
            i;
            
        floor = (!floor && floor !== 0)? 20 : floor;

        var country = ["Deutschland","Testland","Portugal","Pornonien","Vietnam"];

        for (i = 0; i < (n || 5); i++) {
            data.push({
                land: country[i],
                data1: Math.floor(Math.max((Math.random() * 100), floor)),
                data2: Math.floor(Math.max((Math.random() * 100), floor)),
                data3: Math.floor(Math.max((Math.random() * 100), floor)),
            });
        }
        return data;
    };
    
    window.storedata = Ext.create('Ext.data.JsonStore', {
        fields: ['land', 'data1', 'data2', 'data3'],
        data: generateData()
    });
    
});

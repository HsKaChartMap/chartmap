Ext.require(['Ext.data.*']);

Ext.onReady(function() {

    window.generateData = function(n){
        var data = [],
            p = 5,
            i;

        var country = ["Deutschland","Testland","Portugal","Pornonien","Vietnam","sechstes Land"];
        var testdataarray = ["23","34","54","76","3","56","47"];

        for (i = 0; i < country.length; i++) {
            data.push({
                land: country[i],
                data1: testdataarray[i+2],
                data2: testdataarray[i],
                data3: testdataarray[i+1],
            });
        }
        return data;
    };
    
    window.storedata = Ext.create('Ext.data.JsonStore', {
        fields: ['land', 'data1', 'data2', 'data3'],
        data: generateData()
    });
    
});

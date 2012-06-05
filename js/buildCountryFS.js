function buildCountryFS(layer){
    var featureStore;
    var fields = new Array();
    var field_x;
    var model;
    var features = layers.features;
    
    // Testen ob mit length die Anzahl der Elemente ausgegeben wird 
    // Ergebnis sollte sein: id + Anzahl Indikatoren + geometry
    //alert (features[0]['data'].length);
    
    // Schleife durch die Elemente des ersten Landes
    // Achtung: Es könnte sein, dass das erste Land nicht alle Indikatoren enthält
    // Lösung für die Erfassung aller Elemente suchen
    for (i = 0; i < features[0]['data'].length; i++) {
        
        // Prüfen, ob Datentyp=Array --> Indikator
        // Wenn ja: Schleife durch Jahre
        /*
        if (typeof features[i] != 'Array') {
        else { // Element is kein Indikator
        field_x = {
            name: features[i]['data'],
            type: typeof records[i]['data'],
            mapping: features[
        };
        */
        
        // Feld in Feld-Array pushen
        //fields.push(field_x);
        
    }
    
    var model = Ext.define('countryFSModel', fields);

    var featureStore
    
    return featureStore;
}
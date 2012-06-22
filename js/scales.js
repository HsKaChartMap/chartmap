/* Define scale functions here: */
const scale_funs = {
    "NO_SCALING" : function(v) { return v; },
    "SCALE_TIMES_100" : function(v) { return v*100; },
    "SCALE_DIVIDE_100" : function(v) { return v/100; },
	"SCALE_DIVIDE_1000" : function(v) { return v/1000; },
    "SCALE_DIVIDE_10000" : function(v) { return v/10000; },
    "SCALE_RELATIVE": function(v,max) {return 100*(v/max);}
}

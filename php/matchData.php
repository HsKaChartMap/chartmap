<?php

$path = "../data/staaten.json";
// get file contents
$json_string = file_get_contents($path);
// decode the JSON string
$json_object = json_decode($json_string);
// create an array out of the JSON object
$json_array = objectToArray($json_object);

$sampleData = array(	array(	'countryname' => 'Germany',
								'inhabitants' => 80000000),
						array(	'countryname' => 'France',
								'inhabitants' => 40000000)
					);				
					
// Inject properties
for($i=0;$i < count($json_array['features']); $i++) {
	// id
	$json_array['features'][$i]['properties']['id'] = $i;
	// join properties of gapminder data
	for ($j=0;$j < count($sampleData); $j++) {
		if ($json_array['features'][$i]['properties']['SOVEREIGNT'] == $sampleData[$j]['countryname']) {
			foreach($sampleData[$j] as $key => $value) {
				$json_array['features'][$i]['properties'][$key] = $value;
			}
		}
	}
}

// encode into JSON
echo json_encode($json_array);

function objectToArray($d) {
		if (is_object($d)) {
			// Gets the properties of the given object
			// with get_object_vars function
			$d = get_object_vars($d);
		}
 
		if (is_array($d)) {
			/*
			* Return array converted to object
			* Using __FUNCTION__ (Magic constant)
			* for recursive call
			*/
			return array_map(__FUNCTION__, $d);
		}
		else {
			// Return array
			return $d;
		}
	}
	
?>
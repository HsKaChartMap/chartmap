<?php
header('Content-type: application/json');

// path to country geometries
$path = "../data/staaten.json";
// get file contents
$geom_json_string = file_get_contents($path);
// decode the JSON string
$geom_json_object = json_decode($geom_json_string);
// create an array out of the JSON object
$geom_json_array = objectToArray($geom_json_object);

$sampleData = array(	array(	'countryname' => 'Germany',
								'inhabitants' => 80000000),
						array(	'countryname' => 'France',
								'inhabitants' => 40000000)
					);				
					
// Inject properties
for($i=0;$i < count($geom_json_array['features']); $i++) {
	// id
	$geom_json_array['features'][$i]['properties']['id'] = $i;
	// join properties of gapminder data
	for ($j=0;$j < count($sampleData); $j++) {
		if ($geom_json_array['features'][$i]['properties']['SOVEREIGNT'] == $sampleData[$j]['countryname']) {
			foreach($sampleData[$j] as $key => $value) {
				$geom_json_array['features'][$i]['properties'][$key] = $value;
			}
		}
	}
}

print_r($geom_json_array);

// encode into JSON
//echo json_encode($geom_json_array);

// function to convert an object to an array
function objectToArray($d) {
	if (is_object($d)) {
		$d = get_object_vars($d);
	}
	if (is_array($d)) {
		return array_map(__FUNCTION__, $d);
	}
	else {
		// return array
		return $d;
	}
}
?>
<?php

$debug = false;

header('Content-type: application/json');

$key = $_GET['key']; 
// Set your CSV feed to access gapminder data on GoogleDocs
$feed = 'https://docs.google.com/spreadsheet/pub?key='.$key.'&single=true&gid=0&output=csv';
 
// Arrays we'll use later
$keys = array();
$countries = array();
$gapminderArray = array();
$geom_json_array = array();

/* Function: objectToArray
 * converts object into array
 */
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

/* Function: csvToArray
 * converts CSV into associative array
 */ 
function csvToArray($file, $delimiter) { 
  if (($handle = fopen($file, 'r')) !== FALSE) { 
    $i = 0; 
    while (($lineArray = fgetcsv($handle, 4000, $delimiter, '"')) !== FALSE) { 
      for ($j = 0; $j < count($lineArray); $j++) { 
        $arr[$i][$j] = $lineArray[$j]; 
      } 
      $i++; 
    } 
    fclose($handle); 
  } 
  return $arr; 
} 
 
// Do it
$data = csvToArray($feed, ',');

// Set number of elements (minus 1 because we shift off the first row)
$count = count($data) - 1;
 
// use first row for names  
$labels = array_shift($data); 
// extract the indicator
$indicator = array_shift($labels);

foreach ($labels as $label) {
  $keys[] = $label;
}

// shift country names
for ($i = 0; $i < $count; $i++) {
  $countries[] = array_shift($data[$i]);
}

// bring it all together
for ($j = 0; $j < $count; $j++) {
  $d = array_combine($keys, $data[$j]);
  $gapminderArray[] = array('country' => $countries[$j], $indicator => $d, 'id' => $j);
}
// gapminderArray is now ready to join with country geometries

// Load country geometries from staaten.json
// path to country geometries
$path = "../data/staaten.json";
// get file contents
$geom_json_string = file_get_contents($path);
// decode the JSON string
$geom_json_object = json_decode($geom_json_string);
// create an array out of the JSON object
$geom_json_array = objectToArray($geom_json_object);

// nested loop join with unset of values in the gapminder array
foreach($geom_json_array['features'] as $cKey => $cVal) {
	foreach($gapminderArray as $dKey => $dVal) {
		if ($cVal['properties']['SOVEREIGNT'] == $dVal['country']) {
			foreach($dVal as $key => $value) {
				$geom_json_array['features'][$cKey]['properties'][$key] = $value;
			}
			unset($gapminderArray[$dKey]);
		}
	}
}

if ($debug == true) {
    print_r($geom_json_array);
}
else {
    // encode into JSON
    echo json_encode($geom_json_array);
}
?>
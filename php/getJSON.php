<?php
// toggle debug mode
$debug = false;

header('Content-type: application/json');

$keystring = $_GET['keys'];
$keys = explode(",", $keystring);

// Set your CSV feeds to access gapminder data on GoogleDocs
$feeds = array();
for ($i=0;$i<=count($keys)-1;$i++) {
    $feeds[] = 'https://docs.google.com/spreadsheet/pub?key='.$keys[$i].'&single=true&gid=0&output=csv';
}

// Arrays we'll use later
$timeKeys = array();
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
// loop the feeds
for($f=0;$f<=count($feeds)-1;$f++) {
    // Do it
    $data = csvToArray($feeds[$f], ',');

    // Set number of elements (minus 1 because we shift off the first row)
    $count = count($data) - 1;
     
    // use first row for names  
    $labels = array_shift($data); 
    // extract the indicator
    $indicator = array_shift($labels);
    
    unset($timeKeys);
    foreach ($labels as $label) {
      $timeKeys[] = $label;
    }
    // shift country names
    for ($i = 0; $i < $count; $i++) {
      $countries[] = array_shift($data[$i]);
    }

    // bring it all together
    for ($j = 0; $j < $count; $j++) {
      $d = array_combine($timeKeys, $data[$j]);
      $gapminderArray[$f][] = array('country' => $countries[$j], $indicator => $d, 'id' => $j);
    }
    // gapminderArray is now ready to join with country geometries
}

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
// loop over the country geometries in the $geom_json_array
foreach($geom_json_array['features'] as $cKey => $cVal) {
    // loop over the indicators contained in the $gapminderArray
    for($i=0;$i<=count($gapminderArray)-1;$i++) {
        // loop over the elements in a specific indicator array
        foreach($gapminderArray[$i] as $dKey => $dVal) {
            if ($cVal['properties']['SOVEREIGNT'] == $dVal['country']) {
                foreach($dVal as $key => $value) {
                    $geom_json_array['features'][$cKey]['properties'][$key] = $value;
                }
                unset($gapminderArray[$i][$dKey]);
            }
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
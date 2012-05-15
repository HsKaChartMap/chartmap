<?php
header('Content-type: application/json');

$key = $_GET['key']; 
// Set your CSV feed
$feed = 'https://docs.google.com/spreadsheet/pub?key='.$key.'&single=true&gid=0&output=csv';
 
// Arrays we'll use later
$keys = array();
$countries = array();
$newArray = array();
 
// Function to convert CSV into associative array
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
  $newArray[] = array('country' => $countries[$j], $indicator => $d, 'id' => $j);
}
 
// Print it out as JSON
echo json_encode($newArray);

?>
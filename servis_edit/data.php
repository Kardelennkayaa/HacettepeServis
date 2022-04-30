<?php include_once("home.html"); ?>
<?php
include 'db.php';

$get_sql = "SELECT location, recorder, ST_AsGeoJSON(geom), minibus_name FROM minibus_stations";
$resultArray = pg_fetch_all(pg_query($dbcon,$get_sql));
echo json_encode($resultArray);
?>
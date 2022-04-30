<?php include_once("index.html"); ?>
<?php
include 'db.php';



$location = $_POST['userloc'];
$recorder = $_POST['userrecorder'];
$long = $_POST['userlong'];
$lat = $_POST['userlat'];
$minibus_name = $_POST['userminibus_name'];


$add_query = "INSERT INTO public.servis_durak(location, recorder, geom, minibus_name) VALUES ('$location', '$recorder', ST_SetSRID(ST_MakePoint($long,$lat),4326), '$minibus_name')";
$query = pg_query($dbcon,$add_query);

if ($query){
    echo json_encode(array("statusCode"=>200));
} else {
    echo json_encode(array("statusCode"=>201));

}
?>
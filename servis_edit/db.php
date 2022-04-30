<?php

$server = 'ec2-52-54-212-232.compute-1.amazonaws.com';
$username = 'kxwxbmuahnnikn';
$password = 'ff113b7ac0086745ee43338d88a8327aa6a6a1b85fa7e4be36a3585ebd5a1a89';
$db_name = 'dflklgpisre29b';

$dbcon = pg_connect("host=$server port=5432 dbname=$db_name user=$username password=$password")

?>
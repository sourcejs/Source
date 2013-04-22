<?php

/**
 * Created by IntelliJ IDEA.
 * User: alexey.ostrovskiy
 * Date: 15.01.13
 * Time: 18:57
 */

if(isset($_GET["pathToDataFile"])){
    $pathToDataFile = $_GET["pathToDataFile"];

    // open bubble data file
    $bubbleDataFile = dirname(__FILE__)."/../..".$pathToDataFile . "temp/bubbles.dat";
    $fileHandler = fopen($bubbleDataFile, "r") or die("can't open file " . $bubbleDataFile);

    // read bubble data
    $bubbleData = fread($fileHandler, filesize($bubbleDataFile));
    fclose($fileHandler);

    echo $bubbleData;
} else {
    echo "Please specify file path";
}
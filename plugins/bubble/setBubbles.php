<?php

/**
 * Created by IntelliJ IDEA.
 * User: alexey.ostrovskiy
 * Date: 15.01.13
 * Time: 18:57
 */

function replace_unicode_escape_sequence($match) {
    return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE');
}

if(isset($_GET["sendData"])){

    $recievedData = json_decode(stripslashes($_GET["sendData"]), true);

    $pathToDataFile = $recievedData["pathToDataFile"];

    $bubbleData = json_encode($recievedData);
    $bubbleData = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', 'replace_unicode_escape_sequence', $bubbleData);

    // open bubble data file
    $bubbleDataDir = dirname(__FILE__)."/../..".$pathToDataFile . "temp/";

    if (!is_dir($bubbleDataDir)) {
        mkdir($bubbleDataDir);
    }

    $fileHandler = fopen($bubbleDataDir . "bubbles.dat", "w") or die("can't open file");

    if($bubbleData != "") {
        // write bubble data
        fwrite($fileHandler, $bubbleData);
    } else {
        // clear bubble data if no data on input
        fwrite($fileHandler, "");
    }

    fclose($fileHandler);
} else {
    echo "Please specify file path";
}
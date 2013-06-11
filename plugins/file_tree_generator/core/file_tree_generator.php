<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>JSON File tree parser script</title>
</head>
<body>
<?php

ini_set("display_errors", "On");
$DOCUMENT_ROOT = $_SERVER['DOCUMENT_ROOT'];
include $DOCUMENT_ROOT.'/core/global_plugin_config.php';
include '../configs.php';

function my_json_encode($data, $level = 0) {
	if (is_array($data)) {
		$indent = str_repeat("\t",$level+1);
		$indentChild = str_repeat("\t",$level);
		$json = "{" . $indent;
		foreach($data as $key=>$value) {
			$json .= "\n" . $indent . "\"" . $key . "\": " . my_json_encode($value, $level+1) . ",";
		}
		$json = rtrim($json, ",");
		$json .= "\n" . $indentChild . "}";
	} else {
		$json = "\"" . addslashes($data) . "\"";
	}
	return $json;
}

function sortFilesTree($a, $b) {
	if (isset($a["url"]) && is_string($a["url"])) {
		// $a is required file
		return -1;
	} else {
		return 1;
	}
}

function GET_BUBBLES_COUNT($BUBBLE_DATA_PATH) {
	if (file_exists($BUBBLE_DATA_PATH)) {
		$BUBBLE_DATA_FILE = file_get_contents($BUBBLE_DATA_PATH);
		$BUBBLE_COUNT = preg_match_all("/section/", $BUBBLE_DATA_FILE, $BUBBLE_DATA_FILE);
	} else {
		$BUBBLE_COUNT = "0";
	}
	return $BUBBLE_COUNT;
}

function getFilesTree($dir, $includeFilesMask = "/.*/", $scanDirMask = "/.*/", $excludeDirMask = "") {
	global $DOCUMENT_ROOT;
	$arr = array();
	$ffs = scandir($dir);
	$dirContainRequiredFiles = false;
	foreach($ffs as $ff){
		if(substr($ff, 0, 1) != '.' && $ff != false){
			if(is_dir($dir.'/'.$ff)) {
				$subTree = getFilesTree($dir.'/'.$ff, $includeFilesMask, $scanDirMask, $excludeDirMask);
				if ($subTree !== false) {
					uasort($subTree, "sortFilesTree");
					$arr[$ff] = $subTree;
					$dirContainRequiredFiles = true;
				}
			} else {
				if ($excludeDirMask != "" && preg_match($excludeDirMask, $dir)) {
					continue;
				}
				if (!preg_match($scanDirMask, $dir)) {
					continue;
				}
				if (!preg_match($includeFilesMask, $ff)) {
					continue;
				}
				$dirContainRequiredFiles = true;
				$URL = $dir."/".$ff;
				$URL = str_replace("//","/",$URL);

				$urlContents = file_get_contents($URL);

				if (preg_match("/<meta name=\"source-page-role\" content=\"navigation\">/", $urlContents)) {
					$ff = "source_page_navigation";

					preg_match("/<title>(.*)<\/title>/i", $urlContents, $title);
					preg_match("/<\w* class=\"source_catalog_tx\">([^`]*?)<\/\w*>/", $urlContents, $info);

					$URL = str_replace("../../","/", $URL);
					$URL = str_replace($DOCUMENT_ROOT,"", $URL);

					$arr[$ff] = array(
						"url" => $URL,
						// "info" => isset($info[1]) ? $info[1] : "",
						"title" => isset($title[1]) ? $title[1] : "",

					);
				} else {
					preg_match("/<title>(.*)<\/title>/i", $urlContents, $title);
					preg_match("/<meta name=\"keywords\" content=\"([^`]*?)\">/", $urlContents, $keyword);
					preg_match("/<meta name=\"author\" content=\"(.*)\">/", $urlContents, $author);
					preg_match("/<\w* class=\"source_catalog_tx\">([^`]*?)<\/\w*>/", $urlContents, $info);

					$lastmod = date("d.m.y", filemtime($URL));
					$lastmodSec = date("U", filemtime($URL));

					$URL = str_replace("../../","/", $URL);
					$URL = str_replace($DOCUMENT_ROOT,"", $URL);
					$DIR_NAME = dirname($URL);

					$BUBBLE_DATA_PATH = $DOCUMENT_ROOT.$DIR_NAME.'/temp/bubbles.dat';
					$PROJECT_DATA_PATH = $DOCUMENT_ROOT.$DIR_NAME.'/data.json';

					if (file_exists($PROJECT_DATA_PATH)) {
						$json = file_get_contents($PROJECT_DATA_PATH);
						$data = json_decode($json, true);
					}
					$arr[$ff] = array (
						"url" => $URL,
						"title" => isset($title[1]) ? $title[1] : "",
						"author" => isset($author[1]) ? $author[1] : "",
						"lastmod" => $lastmod,
						"lastmodSec" => $lastmodSec,
						"keywords" => isset($keyword[1]) ? $keyword[1] : "",
						"bubbles" => GET_BUBBLES_COUNT($BUBBLE_DATA_PATH),
						"projectData" => isset($data) ? $data : "",
					);
				}
			}
		}
	}
	if ($dirContainRequiredFiles) {
		return $arr;
	}

	return false;
}

$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$start = $time;

file_put_contents($DOCUMENT_ROOT.'/data/pages_tree.json', my_json_encode(getFilesTree(
	$DOCUMENT_ROOT,
	"/".$FILE_MASK_FOR_SEARCH."/",
	"/".$DIR_FOR_FILE_SEARCH."/",
	"/".$EXCLUDE_FOLDERS."|".$GLOBAL_EXCLUDE_DIR."/"
)));

$time = microtime();
$time = explode(' ', $time);
$time = $time[1] + $time[0];
$finish = $time;
$total_time = round(($finish - $start), 4);

echo '<a href="/data/pages_tree.json">JSON File tree</a> generated in '.$total_time.' seconds';

?>
<div style="margin-top: 20px">
	<b>Setting cron task on this script is highly recommended.</b>
</div>
</body>
</html>
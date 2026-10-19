<?php
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/
ini_set('error_reporting', E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', "Off"); // disable error display
ini_set('display_startup_errors', "Off");
ini_set('html_errors', "Off");
ini_set('error_log', "/dev/stderr");
ini_set('log_errors', "On"); // disable error logging

$PAYLOAD = [
    "status" => 0,
    "errors" => [],
    "POST" => $_POST,
    "files" => [],
    "data" => []
];

function thumbnail_leftovers($newtns, $oldtns)
{
    $retval = [];
    foreach ($oldtns as $oldtn) {
        if (!in_array($oldtn["video"], $newtns)) {
            array_push($retval, $oldtn);
        }
    }
    return $retval;
}

try {
    require("settings.php");
    require("db.php");

    $settings = new Settings();
    // Check if a File either exists or has been created successfully on demand
    $fileFailureHandlingInfo = DirectoryDB::create_if_not_exists();
    $PAYLOAD['status'] = $fileFailureHandlingInfo['status'];
    $PAYLOAD['errors'] = array_merge($PAYLOAD['errors'], $fileFailureHandlingInfo['errors']);
    // Create DB
    $ddb = new DirectoryDB(DirectoryDB::DB_FILE, $settings);
    $ddb->setup();

    //var_dump($_POST);

    if (isset($_POST['solicitation'])) {
        $PAYLOAD["settings"] = $settings->config;
        //$PAYLOAD["path"] = thumbnail_dir2path($ddb, $settings->config["preview"]["directory"]);
        $PAYLOAD["path"] = $ddb->thumbnail_dir2path($settings->config["preview"]["directory"]);
        //file_put_contents("/tmp/test.txt", $_POST['solicitation']);
        $jstr = base64_decode($_POST['solicitation']);


        $query = json_decode($jstr, true);
        $PAYLOAD["pathid"] = $ddb->path_get_id($query["path"]);
        $existingThumbnails = $ddb->thumbnails_get($PAYLOAD["pathid"]);
        $PAYLOAD["originalpath"] = $query["path"];

        $PAYLOAD["files"] = [];
        foreach ($query["files"] as $filename) {
            $file = [
                "name" => $filename,
                "thumbnail" => "",
                "exists" => false
            ];
            if (count($existingThumbnails) > 0) {
                foreach ($existingThumbnails as $thumbnail) {
                    //var_dump($thumbnail);
                    if ($thumbnail["video"] == $filename) {
                        $file['thumbnail'] = $thumbnail["thumbnail"];
                        $file["exists"] = true;
                    }
                }
            }
            array_push($PAYLOAD["files"], $file);
        }
        // Cleanup DB
        if (!isset($_POST["nocleanup"])) {
            $PAYLOAD["existingThumbnails"] = $existingThumbnails;
            $leftovers = thumbnail_leftovers($query["files"], $existingThumbnails);
            $PAYLOAD["leftovers"] = $leftovers;
            foreach ($leftovers as $leftover) {
                $ddb->thumbnails_delete($leftover["id"]);
            }
        }
    } else if (isset($_POST["asset"]) && isset($_POST["path"]) && isset($_POST["thumbnail"])) {
        $pathid = $ddb->path_get_id($_POST["path"]);
        if ($_POST["thumbnail"] != "NONE") {
            // Create new Thumbnail
            $filename = hash("sha256", time() . $_POST["thumbnail"]) . ".webp";
            $thumbnaildata = preg_replace("/^data\:image\/[a-z]+\;base64\,/", "", $_POST["thumbnail"], 1);

            // create dir if not present
            $directory = $settings->alias_resolve($settings->config["preview"]["directory"]);
            if(!is_dir($directory)){
                mkdir($directory);
            }

            // thumbnaildir
            $filepath = $directory.$filename;

            $PAYLOAD["thumbnail"] = $filename;
            $PAYLOAD["thumbnailpath"] = $filepath;
            $dbret = $ddb->thumbnails_create($filename, $_POST["asset"], $pathid);
            if ($dbret >= 0) {
                file_put_contents($filepath, base64_decode($thumbnaildata));
            }
        } else {
            $dbret = $ddb->thumbnails_create("NONE", $_POST["asset"], $pathid);
        }

    }

    if (isset($_GET["directory"])) {
        $video_files = [];
        $directory = $ddb->alias_resolve($_GET["directory"]);
        $files = scandir($directory);
        if (!$files) {
            throw new Exception("Failed to scan directory " . $directioy);
        }

        foreach ($files as $file) {
            $type = mime_content_type($directory . $file);
            if (!str_starts_with($type, "video/")) {
                continue;
            }
            $fileinfo = [
                "name" => $file,
                "type" => $type,
                "absolute_path" => $directory . $file,
                "dirid" => $ddb->directory_get_id($directory)
            ];
            array_push($PAYLOAD['files'], $fileinfo);
        }
    }

    if (isset($_GET["settings"])){
        $PAYLOAD["settings"] = $settings->config;
    }

    if (isset($_POST["cleanup"]) || isset($_GET["cleanup"])) {
        // Detect orphans and remove them
        $PAYLOAD["orphans"] = [];
        //$PAYLOAD["orphans_local"] = [];
        $thumbnals = $ddb->thumbnails_get(-1);
        $thumbnail_dir = $settings->alias_resolve($settings->config["preview"]["directory"]);
        $files = scandir($thumbnail_dir);
        foreach ($files as $file) {
            if (!str_ends_with($file, ".webp")) {
                continue;
            }
            $counter = 0;
            foreach ($thumbnals as $thumbnail) {
                if ($thumbnail["thumbnail"] == $file) {
                    $counter++;
                }
            }

            if ($counter == 0) {
                array_push($PAYLOAD["orphans"], $file);
                //array_push($PAYLOAD["orphans_local"], $thumbnail_dir . $file);
                unlink($thumbnail_dir . $file);
            }
        }
        $PAYLOAD["cleanupcount"] = count($PAYLOAD["orphans"]);
    }

    if (isset($_GET["resource"])) {
        switch ($_GET["resource"]) {
            case "playlists":
                $PAYLOAD["data"] = $ddb->playlist_get($_GET["id"] ?? null);
                $PAYLOAD["thumbnailpath"] = $ddb->thumbnail_dir2path($settings->config['preview']["directory"])."playlists/";
                break;
            default:
                break;
        }
    }

    if (isset($_POST["resource"])) {
        switch ($_POST["mode"]) {
            case "modify":
                switch ($_POST["resource"]) {
                    case "playlists":
                        $songid = -1;
                        if(isset($_POST["songid"])){
                            $songid = intval($_POST["songid"]);
                        }else{
                            $songid = $ddb->song_get_id($_POST["song"]);
                        }                        
                        $PAYLOAD["songid"] = $songid;
                        $PAYLOAD["data"] = $ddb->playlist_songs_modify($_POST["playlist"], $songid, isset($_POST["add"]));
                        break;
                    default:
                        break;
                }
                break;
            /*case "add":
                switch ($_POST["resource"]) {
                    case "playlists":
                        // blabla
                        break;
                    default:
                        break;
                }
                break;*/
        }
    }

    //var_dump($ddb->errors);
    $PAYLOAD['errors'] = array_merge($PAYLOAD['errors'], $ddb->errors);
} catch (\Throwable $th) {
    //echo("Exception: ".$th->getMessage());
    $PAYLOAD['status'] = -1;
    //array_push($PAYLOAD['errors'], $th->getMessage());
    array_push($PAYLOAD['errors'], $th->__tostring());
}

header('Content-Type: application/json; charset=utf-8');
echo (json_encode($PAYLOAD));
?>
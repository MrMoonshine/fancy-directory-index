<?php
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

$PAYLOAD = [
    "status" => 0,
    "errors" => [],
    //"POST" => $_POST,
    "files" => []
];

function thumbnail_dir2path($db, $dir){
    // Is it on default document root?
    if(str_starts_with($dir, $_SERVER["DOCUMENT_ROOT"])){
        $dir = str_replace($_SERVER["DOCUMENT_ROOT"], "", $dir);
        if(str_starts_with($dir,"/")){
            return $dir;
        }
        return "/".$dir;
    }
    return $db->alias_resolve($dir, true);
}

function thumbnail_leftovers($newtns, $oldtns){
    $retval = [];
    foreach($oldtns as $oldtn){
        if(!in_array($oldtn["video"], $newtns)){
            array_push($retval, $oldtn);
        }
    }
    return $retval;
}

try {
    require("db.php");
    // Check if a File either exists or has been created successfully on demand
    $fileFailureHandlingInfo = DirectoryDB::create_if_not_exists();
    $PAYLOAD['status'] = $fileFailureHandlingInfo['status'];
    $PAYLOAD['errors'] = array_merge($PAYLOAD['errors'], $fileFailureHandlingInfo['errors']);
    // Create DB
    $ddb = new DirectoryDB(DirectoryDB::DB_FILE);
    $ddb->setup();
    $OPTIONS = $ddb->options_get();

    //var_dump($_POST);

    if (isset($_POST['solicitation'])) {
        $PAYLOAD["path"] = thumbnail_dir2path($ddb, $OPTIONS['thumbnaildir']);
        file_put_contents("/tmp/test.txt", $_POST['solicitation']);
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
        $leftovers = thumbnail_leftovers($query["files"], $existingThumbnails);
        foreach($leftovers as $leftover){
            $ddb->thumbnails_delete($leftover["id"]);
        }
    } else if (isset($_POST["video"]) && isset($_POST["path"]) && isset($_POST["thumbnail"])) {
        // Create new Thumbnail
        $filename = hash("sha256", time() . $_POST["thumbnail"]) . ".webp";
        $thumbnaildata = preg_replace("/^data\:image\/[a-z]+\;base64\,/", "", $_POST["thumbnail"], 1);
        $pathid = $ddb->path_get_id($_POST["path"]);
        // thumbnaildir
        $filepath = $OPTIONS["thumbnaildir"] . $filename;
        //$filepath = "/var/www/fancy-directory-index/settings/data/".$filename;
        $PAYLOAD["thumbnail"] = $filename;
        $dbret = $ddb->thumbnails_create($filename, $_POST["video"], $pathid);
        if($dbret >= 0){
            file_put_contents($filepath, base64_decode($thumbnaildata));
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

    if (isset($_POST["cleanup"])) {
        // Detect orphans and remove them
        $PAYLOAD["orphans"] = [];
        $thumbnals = $ddb->thumbnails_get(-1);
        $files = scandir($OPTIONS['thumbnaildir']);
        foreach($files as $file){
            if(!str_ends_with($file, ".webp")){
                continue;
            }
            $counter = 0;
            foreach($thumbnals as $thumbnail){
                if($thumbnail["thumbnail"] == $file){
                    $counter++;
                }
            }

            if($counter == 0){
                array_push($PAYLOAD["orphans"], $file);
                unlink(DirectoryDB::add_last_slash($OPTIONS['thumbnaildir']).$file);
            }
        }
        $PAYLOAD["cleanupcount"] = count($PAYLOAD["orphans"]);
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
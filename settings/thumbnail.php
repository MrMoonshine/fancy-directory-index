<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$PAYLOAD = [
    "status" => 0,
    "errors" => [],
    "files" => [],
    "POST" => $_POST
];


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
        $jstr = base64_decode($_POST['solicitation']);
        $query = json_decode($jstr, true);
        $PAYLOAD["pathid"] = $ddb->path_get_id($query["path"]);
        $existingThumbnails = $ddb->thumbnails_get($PAYLOAD["pathid"]);

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
    } else if (isset($_POST["video"]) && isset($_POST["path"]) && isset($_POST["thumbnail"])) {
        // Create new Thumbnail
        $filename = hash("sha256", time() . $_POST["thumbnail"]) . ".webp";
        $thumbnaildata = preg_replace("/^data\:image\/[a-z]+\;base64\,/", "", $_POST["thumbnail"], 1);
        $pathid = $ddb->path_get_id($_POST["path"]);
        // thumbnaildir
        $filepath = $OPTIONS["thumbnaildir"] . $filename;
        //$filepath = "/var/www/fancy-directory-index/settings/data/".$filename;
        file_put_contents($filepath, base64_decode($thumbnaildata));
        $ddb->thumbnails_create($filename, $_POST["video"], $pathid);
        $PAYLOAD["thumbnail"] = $filename;
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

    if (isset($_GET["cleanup"])) {

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
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

    if(isset($_GET["directory"])){
        $video_files = [];
        $directory = $ddb->alias_resolve($_GET["directory"]);
        $files = scandir($directory);
        if(!$files){
            throw new Exception("Failed to scan directory ".$directioy);
        }

        foreach($files as $file){
            $type = mime_content_type($directory.$file);
            if(!str_starts_with($type, "video/")){
                continue;
            }
            $fileinfo = [
                "name" => $file,
                "type" => $type,
                "absolute_path" => $directory.$file,
                "dirid" => $ddb->directory_get_id($directory)
            ];
            array_push($PAYLOAD['files'], $fileinfo);
        }
    }

    if(isset($_GET["cleanup"])){

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
echo(json_encode($PAYLOAD));
?>
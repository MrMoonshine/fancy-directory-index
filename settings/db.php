<?php
class DirectoryDB extends SQLite3
{
    public $errors = [];
    const WORKDIR = "data/";
    const DB_FILE = DirectoryDB::WORKDIR . "sqlite3";
    static function create_if_not_exists()
    {
        $retval = ["errors" => [], "status" => 0];
        try {
            // Create the dir if it doesn't exist
            if (!file_exists(self::WORKDIR)) {
                //echo ("Dir doesn't exist! Creating... " . self::WORKDIR . "<br>");
                if (!mkdir(self::WORKDIR)) {
                    array_push($retval["errors"], ["msg" => "Failed to create directory " . self::WORKDIR." . Review permissions!"]);
                    $retval['status'] = 1;
                    return $retval;
                }
            }
            // Create the DB file if it doesn't exist
            if(!file_exists(self::DB_FILE)) {
                if(!touch(self::DB_FILE)){
                    array_push($retval["errors"], ["msg" => "Failed to create file " . self::DB_FILE." . Review permissions!"]);
                    $retval['status'] = 1;
                    return $retval;
                }
            }
        } catch (\Throwable $th) {
            //throw $th;
            echo ("Exception: " . $th->getMessage());
        }
        return $retval;
    }
}
?>
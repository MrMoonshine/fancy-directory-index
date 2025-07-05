<?php
class DirectoryDB extends SQLite3
{
    public $errors = [];
    const WORKDIR = "data/";
    const DB_FILE = DirectoryDB::WORKDIR . "fancydirindex.sqlite3";
    const DDL_FILE = "DDL.sql";

    
    /*
        @brief checks if all necessary tables are available. if not run DDLs
    */
    public function setup(){
        if(!$this->tables_exist()){
            array_push($this->errors, "Tables need to be created");
        }
        array_push($this->errors, "Oida");        
    }

    // Check if the correct tables are in use
    private function tables_exist(){
        $requiredTables = ["options", "directries", "thumbnails"];
        $placeholders = implode(",", array_fill(0, count($requiredTables), "?"));
        $SQL = "SELECT count(1) as tablecount FROM sqlite_master WHERE type='table' and name in (".$placeholders.")";
        $stmt = $this->prepare($SQL);
        if(!$stmt){
            $this->errors_add();
            return false;
        }

        foreach ($requiredTables as $index => $ttable) {
            $stmt->bindValue($index + 1, $ttable, SQLITE3_TEXT);
        }
        $count = $this->querySingle($stmt->getSQL(true));
        if($count === false){
            $this->errors_add();
            return false;
        }

        return $count >= count($requiredTables);
    }

    private function errors_add(){
        array_push($this->errors, $this->lastErrorMsg());
    }

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
                // necessary in case the directory will be owned by another user
                //chmod(self::DB_FILE, 0775);
            }
        } catch (\Throwable $th) {
            //throw $th;
            echo ("Exception: " . $th->getMessage());
        }
        return $retval;
    }
}
?>
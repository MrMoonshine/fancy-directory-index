<?php
//const DEFAULT_DOCUMENT_ROOT = "/var/www/html/";
const DEFAULT_THUMBNAIL_DIR = "/fancy-directory-index/settings/data/";
class DirectoryDB extends SQLite3
{
    public $errors = [];
    const WORKDIR = "../data/";
    const DB_FILE = DirectoryDB::WORKDIR . "fancydirindex.sqlite3";
    const DDL_FILE = "DDL.sql";


    /*
        @brief checks if all necessary tables are available. if not run DDLs
    */
    public function setup()
    {
        if (!$this->tables_exist()) {
            array_push($this->errors, "Tables need to be created");
        }
    }

    public function options_get()
    {
        $retval = [
            "pageicon" => "/favicon.ico",
            "thumbnailgen" => "off",
            "thumbnaildir" => DEFAULT_THUMBNAIL_DIR
        ];
        $SQL = 'select "name", "value" from "options";';
        $results = $this->query($SQL);
        while ($row = $results->fetchArray()) {
            $retval[$row["name"]] = $row["value"];
        }
        return $retval;
    }

    public function options_modify()
    {
        $options = ["pageicon", "thumbnailgen", "thumbnaildir"];
        $dir_forbidden = ["/", "/fancy-directory-index/", "/fancy-directory-index/settings/"];

        foreach ($options as $option) {
            $SQL = <<<SQL
                UPDATE options
                    SET value = :oval
                WHERE name = :oname ;
            SQL;

            $stmt = $this->prepare($SQL);
            if (!$stmt) {
                $this->errors_add();
                return;
            }

            $value = "";
            switch ($option) {
                case "thumbnailgen":
                    if (isset($_POST["thumbnailgen"])) {
                        $value = $_POST["thumbnailgen"];
                    } else {
                        $value = "off";
                    }
                    break;
                case "thumbnaildir":
                    if (in_array($_POST[$option], $dir_forbidden)) {
                        $value = DEFAULT_THUMBNAIL_DIR;
                        array_push($this->errors, "Directory " . $_POST[$option] . " must not be set! Fallback to default: " . DEFAULT_THUMBNAIL_DIR);
                    } else {
                        $value = DirectoryDB::dir_slash_sanitize($_POST[$option]);
                    }
                    break;
                default:
                    $value = $_POST[$option];
                    break;
            }
            $stmt->bindValue(":oval", $value, SQLITE3_TEXT);
            $stmt->bindValue(":oname", $option, SQLITE3_TEXT);

            // Test
            //array_push($this->errors, $stmt->getSQL(true));
            $stmtresult = $stmt->execute();
            if (!$stmtresult) {
                $this->errors_add();
                return;
            }
            //array_push($this->errors, $stmt->getSQL(true));
        }
    }

    public function alias_table()
    {
        $SQL = <<<SQL
            SELECT "id","aliasname","directory" FROM aliases;
        SQL;

        $results = $this->query($SQL);
        while ($row = $results->fetchArray()) {
            $id = $row["id"];
            $name = $row["aliasname"];
            $directory = $row["directory"];
            $formid = "alias-delete-form-" . $id;
            //var_dump($row);
            echo <<<HTML
            <tr>
                <td>
                    <input name="aliasname" type="text" form="$formid" value="$name" readonly/>
                    <form method="POST" id="$formid" class="d-none"></form>
                    <input name="id" form="$formid" value="$id" class="d-none" readonly/>
                    <input name="mode" form="$formid" value="aliasdelete" class="d-none" readonly/>
                </td>
                <td>
                    <input name="directory" type="text" form="$formid" value="$directory" readonly/>
                </td>
                <td>
                    <input type="submit" form="$formid" value="-" class="btn btn-danger"/>
                </td>
            </tr>
            HTML;
        }
    }

    public function alias_create()
    {
        $SQL = <<<SQL
            INSERT INTO aliases (aliasname, directory) VALUES (:aliasname, :dirname);
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":aliasname", DirectoryDB::dir_slash_sanitize($_POST["aliasname"]), SQLITE3_TEXT);
        $stmt->bindValue(":dirname", DirectoryDB::dir_slash_sanitize($_POST["directory"]), SQLITE3_TEXT);

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    public function alias_delete()
    {
        $SQL = <<<SQL
            DELETE FROM aliases WHERE id = :id;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":id", $_POST["id"], SQLITE3_INTEGER);
        
        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    // Check if the correct tables are in use
    private function tables_exist()
    {
        $requiredTables = ["options", "directries", "thumbnails"];
        $placeholders = implode(",", array_fill(0, count($requiredTables), "?"));
        $SQL = "SELECT count(1) as tablecount FROM sqlite_master WHERE type='table' and name in (" . $placeholders . ")";
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return false;
        }

        foreach ($requiredTables as $index => $ttable) {
            $stmt->bindValue($index + 1, $ttable, SQLITE3_TEXT);
        }
        $count = $this->querySingle($stmt->getSQL(true));
        if ($count === false) {
            $this->errors_add();
            return false;
        }

        return $count >= count($requiredTables);
    }

    private function errors_add()
    {
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
                    array_push($retval["errors"], ["msg" => "Failed to create directory " . self::WORKDIR . " . Review permissions!"]);
                    $retval['status'] = 1;
                    return $retval;
                }
            }
            // Create the DB file if it doesn't exist
            if (!file_exists(self::DB_FILE)) {
                if (!touch(self::DB_FILE)) {
                    array_push($retval["errors"], ["msg" => "Failed to create file " . self::DB_FILE . " . Review permissions!"]);
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

    static function dir_slash_sanitize($dir){
        if(str_ends_with($dir,"/")){
            return $dir;
        }
        return $dir."/";
    }
}
?>
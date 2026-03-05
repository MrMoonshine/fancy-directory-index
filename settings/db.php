<?php
require("upload.php");
//const DEFAULT_DOCUMENT_ROOT = "/var/www/html/";
const DEFAULT_THUMBNAIL_DIR = "/fancy-directory-index/settings/data/";
class DirectoryDB extends SQLite3
{
    public $errors = [];
    const WORKDIR = "data/";
    const DB_FILE = DirectoryDB::WORKDIR . "fancydirindex.sqlite3";
    const DDL_FILE = "DDL.sql";

    public function __construct($filename)
    {
        try {
            parent::__construct($filename);
        } catch (\Throwable $th) {
            echo ($th->getMessage());
            //throw $th;
        }
    }

    /*
        @brief checks if all necessary tables are available. if not run DDLs
    */
    public function setup($base = "./")
    {
        if (!$this->tables_exist()) {
            //array_push($this->errors, "Tables need to be created");
            $ddl = file_get_contents($base . DirectoryDB::DDL_FILE);
            $this->exec($ddl);

            if (!$this->tables_exist()) {
                array_push($this->errors, "Failed to create tables! " . $this->lastErrorMsg());
            }
        }
    }

    public function path_get_id($path)
    {
        $this->path_create($path);

        $SQL = <<<SQL
            SELECT id FROM paths WHERE path=:path ;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":path", DirectoryDB::add_last_slash($path), SQLITE3_TEXT);
        $result = $this->querySingle($stmt->getSQL(true));
        if (!$result) {
            throw new Exception("Failed to create path entry in DB!");
        }
        return $result;
    }

    private function path_create($path)
    {
        $SQL = <<<SQL
            INSERT OR IGNORE INTO paths ("path") VALUES (:pathname) ;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":pathname", DirectoryDB::add_last_slash($path), SQLITE3_TEXT);

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    public function thumbnails_get($pathid)
    {
        $retval = [];
        $SQL = 'SELECT * FROM thumbnails where path=:id';
        if ($pathid < 0) {
            $SQL .= " OR 1=1";
        }
        $SQL .= ";";

        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }

        $stmt->bindValue(":id", $pathid, SQLITE3_INTEGER);
        //array_push($this->errors, $stmt->getSQL(true));
        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
        //array_push($this->errors, $stmt->getSQL(true));
        while ($row = $stmtresult->fetchArray()) {
            array_push($retval, $row);
        }
        return $retval;
    }

    public function thumbnails_create($thumbnail, $video, $path)
    {
        $SQL = <<<SQL
            SELECT count(1) as "resultcount" from thumbnails where video=:video and path=:path ;
        SQL;

        $stmtl = $this->prepare($SQL);
        if (!$stmtl) {
            $this->errors_add();
            return -1;
        }
        $stmtl->bindValue(":video", $video, SQLITE3_TEXT);
        $stmtl->bindValue(":path", $path, SQLITE3_INTEGER);

        $counter = $this->querySingle($stmtl->getSQL(true));
        if ($counter > 0) {
            array_push($this->errors, "Already exists, not creating new thumbnail!");
            return -1;
        }

        $SQL = <<<SQL
            INSERT INTO thumbnails (thumbnail, video, path) VALUES (:thumbnail, :video, :path);
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return -1;
        }
        $stmt->bindValue(":thumbnail", $thumbnail, SQLITE3_TEXT);
        $stmt->bindValue(":video", $video, SQLITE3_TEXT);
        $stmt->bindValue(":path", $path, SQLITE3_INTEGER);

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return -1;
        }
        return 0;
    }

    public function thumbnails_delete($id)
    {
        $SQL = <<<SQL
            DELETE FROM thumbnails WHERE id = :id;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":id", $id, SQLITE3_INTEGER);

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    public function options_get()
    {
        $retval = [
            "pageicon" => "/favicon.ico",
            "thumbnailgen" => "off",
            "thumbnaildir" => DEFAULT_THUMBNAIL_DIR,
        ];
        $SQL = 'select "name", "value" from "options";';
        $results = $this->query($SQL);
        while ($row = $results->fetchArray()) {
            $retval[$row["name"]] = $row["value"];
        }
        $retval["docroot"] = $_SERVER["DOCUMENT_ROOT"];
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

    public function alias_get()
    {
        $retval = [];
        $SQL = <<<SQL
            SELECT "id","aliasname","directory" FROM aliases;
        SQL;

        $results = $this->query($SQL);
        while ($row = $results->fetchArray()) {
            array_push($retval, $row);
        }
        return $retval;
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

    public function alias_resolve($pathname, $reverse = false)
    {
        $aliases = $this->alias_get();
        $docroot = DirectoryDB::remove_last_slash($_SERVER["DOCUMENT_ROOT"]);
        $directory = $docroot . $pathname;
        foreach ($aliases as $alias) {
            $patheval = DirectoryDB::add_last_slash($pathname);
            if (!$reverse && str_contains($patheval, $alias["aliasname"])) {
                return str_replace($alias["aliasname"], $alias["directory"], $patheval);
            } else if ($reverse) {
                // Treat incoming $pathname as directory here
                if (str_starts_with($pathname, $alias["directory"])) {
                    $dir = str_replace($alias["directory"], $alias["aliasname"], $pathname);
                    return $dir;
                }
            }
        }
        return $reverse ? $pathname : DirectoryDB::add_last_slash($directory);
    }

    public function directory_get_id($path)
    {
        $this->directory_create($path);

        $SQL = <<<SQL
            SELECT id FROM directories WHERE pathname=:path ;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":path", $path, SQLITE3_TEXT);
        $result = $this->querySingle($stmt->getSQL(true));
        if (!$result) {
            throw new Exception("Failed to create Directory entry in DB!");
        }
        return $result;
    }

    private function directory_create($path)
    {
        $SQL = <<<SQL
            INSERT OR IGNORE INTO directories ("pathname") VALUES (:pathname) ;
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }
        $stmt->bindValue(":pathname", $path, SQLITE3_TEXT);

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    public function playlist_create()
    {
        $SQL = <<<SQL
            INSERT INTO playlists ("name") VALUES ("New Playlist #" || (SELECT (count(1) + 1) FROM playlists));
        SQL;
        $stmt = $this->prepare($SQL);
        if (!$stmt) {
            $this->errors_add();
            return;
        }

        $stmtresult = $stmt->execute();
        if (!$stmtresult) {
            $this->errors_add();
            return;
        }
    }

    public function playlist_delete($id)
    {
        $results = $this->universalDML("DELETE FROM playlist_songs WHERE playlist = :id", ["id" => intval($id)]);
        $results = $this->universalDML("DELETE FROM playlists WHERE id = :id", ["id" => intval($id)]);
        if (!$results) {
            $this->errors_add();
            return;
        }
    }

    public function playlist_rename($id, $name)
    {
        if (strlen($name) < 1) {
            array_push($this->errors, "Name is invalid!");
            return;
        }
        $SQL = <<<SQL
            UPDATE playlists SET
                name = :name
            WHERE
            id = :id;
        SQL;

        $results = $this->universalDML($SQL, ["name" => $name, "id" => intval($id)]);
        if (!$results) {
            $this->errors_add();
            return;
        }
    }

    public function playlist_image($id)
    {
        $options = $this->options_get();
        $target_dir = $options["thumbnaildir"] . "playlists/";
        if (!is_dir($target_dir)) {
            if (!mkdir($target_dir)) {
                array_push($this->errors, "Failed to find or create target directory: " . $target_dir . " !");
                return;
            }
        }

        $exten = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
        $_FILES["image"]["name"] = "tn_" . strval(time()) . "." . $exten;
        $uploadresult = uploadFile("image", $target_dir);
        if ($uploadresult["status"] != 0) {
            array_push($this->errors, "Failed to upload file!");
            return;
        }
        $SQL = <<<SQL
            UPDATE playlists SET
                icon = :image
            WHERE
            id = :id;
        SQL;

        $results = $this->universalDML($SQL, ["image" => $_FILES["image"]["name"], "id" => intval($id)]);
        if (!$results) {
            $this->errors_add();
            return;
        }
    }

    public function playlist_get($id = null)
    {
        $retval = [];
        $params = [];
        $filters = "WHERE 1=1 ";
        if ($id) {
            $filters .= " AND id = :id ";
            $params["id"] = intval($id);
        }
        $results = $this->universalDML(<<<SQL
            SELECT 
                *,
                (select count(1) from playlist_songs where playlist = playlists.id) as songCount
            FROM playlists
            $filters
            ORDER BY name ASC
        SQL, $params);
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            if (!$id) {
                array_push($retval, $row);
                continue;
            }
            $row["songs"] = $this->queryArrayBound(<<<SQL
                SELECT * FROM v_playlist_songs WHERE playlist = :playlist ;
            SQL, ["playlist" => intval($id)]);
            array_push($retval, $row);
        }

        return $retval;
    }

    public function song_get_id($songname)
    {
        $pathname = "";
        //$songname = urldecode($songname);
        if (str_contains($songname, "/")) {
            $pathname = dirname($songname) . "/";
            $songname = basename($songname);
        } else if (isset($_POST["path"])) {
            $pathname = $_POST["path"];
        }
        //$songname = urlencode($songname);

        //array_push($this->errors, 'Pathname: "'.$pathname.'" ; Songname "'.$songname.'"');

        $pathid = $this->path_get_id($pathname);
        $retval = -1;
        $tries = 0;
        do {
            $retval = $this->querySingleBound(<<<SQL
                SELECT id FROM songs
                WHERE path = :path AND song = :song ;
            SQL, ["path" => intval($pathid), "song" => strval($songname)]);
            //array_push($this->errors, "Here 1: ".$retval);
            if ($retval != false && $retval != null) {
                break;
            }
            $retval = -1;
            $tries++;
            $this->universalDML(<<<SQL
                INSERT OR IGNORE INTO songs (path, song) VALUES (:path, :song);
            SQL, ["path" => intval($pathid), "song" => strval($songname)]);
        } while ($retval < 0 && $tries < 2);

        return $retval;
    }

    public function playlist_songs_modify($playlist, $song, $add = false)
    {
        if (!$add) {
            // Deleting
            $occurances = $this->querySingleBound(<<<SQL
                delete from playlist_songs where playlist = :playlist and song = :song;
            SQL, ["playlist" => intval($playlist), "song" => intval($song)]);
            return null;
        }
        // Adding
        $occurances = $this->querySingleBound(<<<SQL
                select count(1) from playlist_songs where playlist = :playlist and song = :song;
        SQL, ["playlist" => intval($playlist), "song" => intval($song)]);

        if (($occurances ?? 0) > 0) {
            array_push($this->errors, "Song " . urldecode($_POST["song"]) . " already esxists in this playlist! Thus, not adding!");
            return false;
        }

        return $this->universalDML(<<<SQL
            INSERT OR IGNORE INTO playlist_songs (song, playlist, timestamp) VALUES (:song, :playlist, :timestamp);
        SQL, [
            "song" => intval($song),
            "playlist" => intval($playlist),
            "timestamp" => strval(date("Y-m-d H:i"))
        ]);
    }

    // Check if the correct tables are in use
    private function tables_exist()
    {
        $requiredTables = ["options", "directories", "thumbnails"];
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

    private function universalStatement($sql, $params = [])
    {
        $stmt = $this->prepare($sql);
        if (!$stmt) {
            array_push($this->errors, $this->lastErrorMsg());
            return false;
        }

        foreach (array_keys($params) as $key) {
            $type = gettype($params[$key]);
            switch ($type) {
                case 'integer':
                    $stmt->bindValue($key, $params[$key], SQLITE3_INTEGER);
                    break;
                case 'double':
                    $stmt->bindValue($key, $params[$key], SQLITE3_FLOAT);
                    break;
                case 'string':
                    $stmt->bindValue($key, $params[$key], SQLITE3_TEXT);
                    break;
                case 'NULL':
                    $stmt->bindValue($key, $params[$key], SQLITE3_NULL);
                    break;
                default:
                    array_push($this->errors, 'WARNING: Unknown type: "' . $type . '" for key "' . $key . '". Casting to String');
                    $stmt->bindValue($key, strval($params[$key]), SQLITE3_TEXT);
                    break;
            }
        }
        //array_push($this->errors, $stmt->getSQL(true));
        return $stmt;
    }

    public function universalDML($sql, $params = [])
    {
        $stmt = $this->universalStatement($sql, $params);
        if (!$stmt) {
            return false;
        }
        //array_push($this->errors, $stmt->getSQL(true));
        $result = $stmt->execute();
        if (!$result) {
            array_push($this->errors, $this->lastErrorMsg());
        }
        return $result;
    }

    public function querySingleBound($query, $params = [], $entireRow = false)
    {
        $stmt = $this->universalStatement($query, $params);
        if (!$stmt) {
            return false;
        }
        return parent::querySingle($stmt->getSQL(true), $entireRow);
    }

    public function queryArrayBound($query, $params = [], $entireRow = false)
    {
        $retval = [];
        $stmt = $this->universalStatement($query, $params);
        if (!$stmt) {
            return false;
        }

        $results = $this->universalDML($query, $params);
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            array_push($retval, $row);
        }
        return $retval;
    }

    public function thumbnail_dir2path($dir)
    {
        // Is it on default document root?
        if (str_starts_with($dir, $_SERVER["DOCUMENT_ROOT"])) {
            $dir = str_replace($_SERVER["DOCUMENT_ROOT"], "", $dir);
            if (str_starts_with($dir, "/")) {
                return $dir;
            }
            return "/" . $dir;
        }
        return $this->alias_resolve($dir, true);
    }

    static function create_if_not_exists($base = "./")
    {
        $retval = ["errors" => [], "status" => 0];
        try {
            // Create the dir if it doesn't exist
            if (!file_exists($base . self::WORKDIR)) {
                //echo ("Dir doesn't exist! Creating... " . self::WORKDIR . "<br>");
                if (!mkdir($base . self::WORKDIR)) {
                    array_push($retval["errors"], ["msg" => "Failed to create directory " . $base . self::WORKDIR . " . Review permissions!"]);
                    $retval['status'] = 1;
                    return $retval;
                }
            }
            // Create the DB file if it doesn't exist
            if (!file_exists($base . self::DB_FILE)) {
                if (!touch($base . self::DB_FILE)) {
                    array_push($retval["errors"], ["msg" => "Failed to create file " . $base . self::DB_FILE . " . Review permissions!"]);
                    $retval['status'] = 1;
                    return $retval;
                }
                // necessary in case the directory will be owned by another user
                //chmod(self::DB_FILE, 0775);
            }
        } catch (\Throwable $th) {
            //throw $th;
            //echo ("Exception: " . $th->getMessage());
            array_push($retval["errors"], $th->__tostring());
        }
        return $retval;
    }

    static function dir_slash_sanitize($dir)
    {
        if (str_ends_with($dir, "/")) {
            return $dir;
        }
        return $dir . "/";
    }

    static function remove_last_slash($path)
    {
        if (str_ends_with($path, "/")) {
            return substr($path, 0, strlen($path) - 1);
        }
        return $path;
    }

    static function add_last_slash($path)
    {
        if (str_ends_with($path, "/")) {
            return $path;
        }
        return $path . "/";
    }
}
?>
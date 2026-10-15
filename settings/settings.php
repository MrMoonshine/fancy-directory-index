<?php
class Settings
{
    const CONFIG_DEFAULT = [
        "favicon" => "/favicon.ico",
        "preview" => [
            "enabled" => true,
            "imageMaxSize" => "1MB",
            "iconSize" => 96,
            "directory" => "/fancy-directory-index/settings/data/previews/"
        ],
        "alias" => [
            [
                "name" => "Icon Theme",
                "path" => "/fdi-icon-theme/",
                "dir" => "/usr/share/icons/oxygen/"
            ]
        ]
    ];
    const CONFIG_FILE = "data/config.yml";
    const SOURCE_DEFAULT = "(built-in)";

    public $source;
    public $config;

    public function __construct()
    {
        $this->config = Settings::CONFIG_DEFAULT;
        $this->source = Settings::SOURCE_DEFAULT;

        try {
            if (!is_file(Settings::CONFIG_FILE)) {
                yaml_emit_file(Settings::CONFIG_FILE, Settings::CONFIG_DEFAULT);
            }

            $result = yaml_parse_file(Settings::CONFIG_FILE);
            if ($result == false) {
                throw new Exception("yaml_parse: false on failure", 1);
            }
            // Replace missing config with default config
            $this->config = array_replace_recursive(Settings::CONFIG_DEFAULT, $result);
        } catch (\Throwable $th) {
            $this->config = Settings::CONFIG_DEFAULT;
            $this->source = Settings::SOURCE_DEFAULT;
        }
    }

    public function alias_resolve($pathname, $reverse = false)
    {
        $aliases = $this->config["alias"];
        $docroot = Settings::remove_last_slash($_SERVER["DOCUMENT_ROOT"]);
        $directory = $docroot . $pathname;

        if(!$reverse && str_starts_with($pathname, "/fancy-directory-index/settings/")){
            return str_replace("/fancy-directory-index/settings", dirname(__FILE__), $pathname);
        }

        foreach ($aliases as $alias) {
            $patheval = Settings::add_last_slash($pathname);
            if (!$reverse && str_contains($patheval, $alias["path"])) {
                return str_replace($alias["path"], $alias["dir"], $patheval);
            } else if ($reverse) {
                // Treat incoming $pathname as directory here
                if (str_starts_with($pathname, $alias["dir"])) {
                    $dir = str_replace($alias["dir"], $alias["path"], $pathname);
                    return $dir;
                }
            }
        }
        return $reverse ? $pathname : Settings::add_last_slash($directory);
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
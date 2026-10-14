<?php
class Settings
{
    const CONFIG_DEFAULT = [
        "favicon" => "/favicon.ico",
        "preview" => [
            "imageMaxSize" => "1MB",
            "directory" => "/fancy-directory-index/settings/data/"
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
}
?>
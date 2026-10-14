<!doctype html>
<html lang="de">

<head>
    <meta charset="utf-8">
    <meta lang="de_AT">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/aero.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/main.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/settings.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/inputs.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/toast.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body class="wallpaper d-block">
    <nav>
        <div class="d-flex flex-nowrap justify-content-between align-items-center nav-container">
            <h1 class="m-0">Settings</h1>
            <div class="d-flex gap align-items-center">
                <button onclick="history.back()" class="btn big append w-unset">
                    <div class="masked-icon" style="mask-image: url('/fancy-directory-index/assets/go-previous.svg')">
                    </div>
                </button>
            </div>
        </div>
        <div class="d-flex gap justify-content-center border-top">
            <div id="sortingButtons"></div>
            <div class="d-flex align-items-center d-desktop">
                <div class="text-petite d-flex gap justify-content-center">
                    <div id="directory-info-count"></div>
                    <hr>
                    <div title="Non-recursive" id="directory-info-size"></div>
                </div>
            </div>
        </div>
    </nav>
    <div class="dashboard">
        <div class="widget">
            <header>
                <h2>Customization</h2>
            </header>
            <article>
                <form id="themeform">
                    <table class="options">
                        <tr>
                            <th>Default Accent Color</th>
                            <td>
                                <div class="input-group">
                                    <input type="color" name="color">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Page Icon</th>
                            <td>
                                <div class="input-group">
                                    <input type="text" name="pageicon" value="">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Background Image</th>
                            <td>
                                <div class="input-group">
                                    <input type="text" name="background" value="">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Gallery Files Horizontal</th>
                            <td>
                                <div class="input-group">
                                    <input type="range" name="horizontal" class="form-range" id="files-horizontal"
                                        min="2" max="12" step="1">
                                    <div id="files-horizontal-display" class="input-group-prepend">
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>Gallery Files Vertical</th>
                            <td>
                                <div class="input-group">
                                    <input type="range" name="vertical" class="form-range" id="files-vertical" min="2"
                                        max="12" step="1">
                                    <div id="files-vertical-display" class="input-group-prepend">
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </form>
            </article>
            <footer>
                <input form="themeform" type="submit" class="btn" value="Submit">
            </footer>
        </div>
        <div class="widget">
            <header>
                <h2>Cleanup</h2>
            </header>
            <article>
                <p>
                    Remove orphan thumbnails manually. They may pile up in case files get moved around or deleted on
                    the system.
                </p>
                <form id="cleanupform" action="/fancy-directory-index/settings/thumbnail.php">
                    <input name="cleanup" value="1" class="d-none" />
                </form>
                <input form="cleanupform" type="submit" class="btn" value="Cleanup">
                <div id="cleanupformstatus"></div>
                <p>
                    To automate orphan cleanup you can add this line to your cronjobs:<br>
                    <code>/usr/bin/curl -k https://[::1]/fancy-directory-index/settings/thumbnail.php?cleanup=1</code>
                </p>
            </article>
        </div>
        <div class="widget">
            <header>
                <h2>Information</h2>
            </header>
            <article>
                <?php phpinfo(); ?>
                <?php
                $addr = array(
                    "given" => "Chris",
                    "family" => "Dumars",
                    "address" => array(
                        "lines" => "458 Walkman Dr.
            Suite #292",
                        "city" => "Royal Oak",
                        "state" => "MI",
                        "postal" => 48046,
                    ),
                );
                $yaml = "";
                $yaml = yaml_emit($addr);
                ?>
                <pre>
                    <?php echo($yaml); ?>
                </pre>
            </article>
        </div>
    </div>

    <script src="/fancy-directory-index/js/common.js"></script>
    <script src="/fancy-directory-index/js/toast.js"></script>
    <script src="/fancy-directory-index/js/settings.js"></script>
</body>

</html>
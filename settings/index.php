<!doctype html>
<html lang="de">

<head>
	<meta charset="utf-8">
	<meta lang="de_AT">
	<link rel="icon" type="image/x-icon" href="/favicon.ico">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/main.css">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/settings.css">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/inputs.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/toast.css">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
	<div id="content">
		<nav class="d-flex flex-nowrap justify-content-between">
			<!--<img alt="Icon" src=".directory" onerror='this.style.display = "none"'/>-->
			<div class="d-flex">
				<div class="nav-flex-column">
					<img class="favicon" alt="Icon" src="/favicon.ico" onerror='this.style.display = "none"' />
				</div>
				<div class="nav-flex-column">
					<h1>Fancy-Directory-Index Settings</h1>
				</div>
			</div>
			<div class="d-flex gap">
				<div class="nav-flex-column">
                    <div class="btn-group">
                        <button onclick="history.back()" class="btn btn-outline big append">
                            &#10558;
                        </button>
                        <a href="/" class="btn btn-outline big prepend">
                            <img alt="Home" src="/favicon.ico">
                        </a>
                    </div>
				</div>
			</div>
		</nav>
        <?php
            $PAYLOAD = [
                "status" => 0,
                "errors" => [],
                "POST" => $_POST
            ];
            try {
                require("db.php");
                // Check if a File either exists or has been created successfully on demand
                $fileFailureHandlingInfo = DirectoryDB::create_if_not_exists();
                $PAYLOAD['status'] = $fileFailureHandlingInfo['status'];
                array_merge($PAYLOAD['errors'], $fileFailureHandlingInfo['errors']);
                // Create DB
                $ddb = new DirectoryDB(DirectoryDB::DB_FILE);
                $ddb->setup();
                //var_dump($ddb->errors);
                array_merge($PAYLOAD['errors'], $ddb->errors);
            } catch (\Throwable $th) {
                //echo("Exception: ".$th->getMessage());
                $PAYLOAD['status'] = -1;
                array_push($PAYLOAD['errors'], $th->getMessage());
            }
        ?>
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
                                    <input type="range" name="horizontal" class="form-range" id="files-horizontal" min="2" max="12" step="1">
                                    <div id="files-horizontal-display" class="input-group-prepend">
                                    </div>
                                </div>
                            </td>  
                            </tr>
                            <tr>
                            <th>Gallery Files Vertical</th>  
                            <td>
                                <div class="input-group">
                                    <input type="range" name="vertical" class="form-range" id="files-vertical" min="2" max="12" step="1">
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
                    <h2>Server Settings</h2>
                </header>
				<article>
                    <form id="customizationform" method="POST">
                        <table class="options">
                            <tr>
                            <th>Page Icon</th>  
                            <td>
                                <div class="input-group">
                                    <input type="text" name="favicon" value="#aa8812">
                                </div>
                            </td>  
                            </tr>
                            <tr>
                            <th>Default Accent Color</th>  
                            <td>
                                <div class="input-group">
                                    <input type="color" name="color">
                                </div>
                            </td>  
                            </tr>
                            <tr>
                            <th>Generate Video Thumbnails</th>  
                            <td>
                                    <label class="switch">
                                        <input type="checkbox">
                                        <span class="slider round"></span>
                                    </label>
                            </td>  
                            </tr>
                        </table>
                    </form>
                </article>
                <footer>
                    <input form="customizationform" type="submit" class="btn" value="Submit">
                </footer>
			</div>
            <div class="widget">
                <header>
                    <h2>Aliases</h2>
                </header>
				<article>
                    <!--<form method="POST">
                        
                    </form>-->
                    <table>
                        <thead>
                            <tr>
                                <th>Alias</th>
                                <th>Directory</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php $ddb->alias_table(); ?>
                        </tbody>
                        <tfooter>
                            <tr>
                                <td>
                                    <input name="aliasname" type="text" form="alias-add-form" value="$name" readonly/>
                                    <form method="POST" id="alias-add-form" class="d-none"></form>
                                    <input name="mode" form="alias-add-form" value="aliasadd" class="d-none" readonly/>
                                </td>
                                <td>
                                    <input name="directory" type="text" form="alias-add-form" value="$directory" readonly/>
                                </td>
                                <td>
                                    <input type="submit" form="alias-add-form" value="+" class="btn-danger"/>
                                </td>
                            </tr>
                        </tfooter>
                    </table>
                </article>
			</div>
        </div>
    </div>
    <script type='text/javascript'>
    <?php
    $js_array = json_encode($PAYLOAD);
    echo "var PHP_PAYLOAD = ". $js_array . ";\n";
    ?>
    console.log("PHP PAYLOAD:");
    console.log(PHP_PAYLOAD);
    </script>
    <script src="/fancy-directory-index/js/common.js"></script>
    <script src="/fancy-directory-index/js/toast.js"></script>
    <script src="/fancy-directory-index/js/settings.js"></script>
</body>
</html>

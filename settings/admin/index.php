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
					<h1>Admin Settings</h1>
				</div>
			</div>
			<div class="d-flex gap">
				<div class="nav-flex-column">
                    <div class="btn-group">
                        <button onclick="history.back()" class="btn btn-outline big append w-unset">
                            &#10558; Back
                        </button>
                        <a href="../" class="btn btn-outline big w-unset center flex-vertical-center">
                            ⚙️ Basic Settings
                        </a>
                        <a href="/" class="btn btn-outline big prepend w-unset">
                            <div class="d-flex">
                                <img alt="Home" src="/favicon.ico">
                                <div class="flex-vertical-center">
                                    Home
                                </div>
                            </div>
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
                require("../db.php");
                // Check if a File either exists or has been created successfully on demand
                $fileFailureHandlingInfo = DirectoryDB::create_if_not_exists("../");
                $PAYLOAD['status'] = $fileFailureHandlingInfo['status'];
                $PAYLOAD['errors'] = array_merge($PAYLOAD['errors'], $fileFailureHandlingInfo['errors']);
                // Create DB
                $ddb = new DirectoryDB("../".DirectoryDB::DB_FILE);
                $ddb->setup("../");

                //echo("../".DirectoryDB::DB_FILE." exists? ".file_exists("../".DirectoryDB::DB_FILE));

                // Handling of DB stuff
                echo($_POST["mode"]);
                switch($_POST["mode"]){
                    case "options":
                        $ddb->options_modify();
                        break;
                    case "aliasadd":
                        $ddb->alias_create();
                        break;
                    case "aliasdelete":
                        $ddb->alias_delete();
                        break;
                    default:
                        break;
                }
                // Get options
                $OPTIONS = $ddb->options_get();
                //var_dump($ddb->errors);
                $PAYLOAD['errors'] = array_merge($PAYLOAD['errors'], $ddb->errors);
            } catch (\Throwable $th) {
                //echo("Exception: ".$th->getMessage());
                $PAYLOAD['status'] = -1;
                //array_push($PAYLOAD['errors'], $th->getMessage());
                array_push($PAYLOAD['errors'], $th->__tostring());
            }
        ?>
		<div class="dashboard">
			<div class="widget">
                <header>
                    <h2>Server Settings</h2>
                </header>
                <script type='text/javascript'>
                <?php
                $js_array = json_encode($PAYLOAD);
                echo "var PHP_PAYLOAD = ". $js_array . ";\n";
                ?>
                console.log("PHP PAYLOAD:");
                console.log(PHP_PAYLOAD);
                </script>
				<article>
                    <form id="customizationform" method="POST">
                        <input type="hidden" name="mode" value="options" readonly>
                        <table class="options">
                            <tr>
                            <th>Page Icon</th>  
                            <td>
                                <div class="input-group">
                                    <input type="text" name="pageicon" value="<?php echo($OPTIONS['pageicon']); ?>">
                                </div>
                            </td>  
                            </tr>
                            <tr>
                            <th>Generate Video Thumbnails</th>  
                            <td>
                                    <label class="switch">
                                        <input type="checkbox" name="thumbnailgen" <?php
                                            if($OPTIONS['thumbnailgen'] == "on"){
                                                echo("checked");
                                            }
                                        ?>>
                                        <span class="slider round"></span>
                                    </label>
                            </td>  
                            </tr>
                            <tr>
                            <th>Thumbnail Directory</th>  
                            <td>
                                <div class="input-group">
                                    <input type="text" name="thumbnaildir" value="<?php echo($OPTIONS['thumbnaildir']); ?>">
                                </div>
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
                    <table class="table">
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
                        <tfoot>
                            <tr>
                                <td>
                                    <input name="aliasname" type="text" form="alias-add-form"/>
                                    <form method="POST" id="alias-add-form" class="d-none"></form>
                                    <input name="mode" form="alias-add-form" value="aliasadd" class="d-none" readonly/>
                                </td>
                                <td>
                                    <input name="directory" type="text" form="alias-add-form"/>
                                </td>
                                <td>
                                    <input type="submit" form="alias-add-form" value="+" class="btn btn-success"/>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    <p><i>Aliases with regex are not supported. Only simple Alias to directory possible.</i></p>
                </article>
			</div>
        </div>
    </div>
    <script src="/fancy-directory-index/js/common.js"></script>
    <script src="/fancy-directory-index/js/toast.js"></script>
    <script src="/fancy-directory-index/js/settings.js"></script>
    <script>
        if(PHP_PAYLOAD["POST"].length > 0){
            SETTINGS_TOAST.show(
                PHP_PAYLOAD["errors"].length < 1 ? "Success" : "Error",
                "",
                12,
                Toast.BUTTONS_NONE
            );
            SETTINGS_TOAST.setListContent(PHP_PAYLOAD["errors"]);
        }
    </script>
</body>
</html>

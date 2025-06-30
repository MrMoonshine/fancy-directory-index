<!doctype html>
<html lang="de">

<head>
	<meta charset="utf-8">
	<meta lang="de_AT">
	<link rel="icon" type="image/x-icon" href="/favicon.ico">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/main.css">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/settings.css">
	<link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/inputs.css">
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
					<a class="btn btn-outline big">
						<img alt="Settings" src="/assets/icons/pencil.webp">
					</a>
				</div>
			</div>
		</nav>
        <?php
            try {
                require("db.php");
                var_dump(DirectoryDB::create_if_not_exists());
                $ddb = new DirectoryDB(DirectoryDB::DB_FILE);
                var_dump($ddb->errors);
            } catch (\Throwable $th) {
                echo("Exception: ".$th->getMessage());
            }
        ?>
		<div class="dashboard">
			<div class="widget">
                <header>
                    <h2>Customization</h2>
                </header>
				<article>
                    <form method="POST">
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
                            <th>Accent Color</th>  
                            <td>
                                <div class="input-group">
                                    <input type="color" name="color" value="#aa8812">
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
                    <input type="submit" class="btn" value="Submit">
                </footer>
			</div>
            <div class="widget">
                <header>
                    <h2>Aliases</h2>
                </header>
				<article>
                    <form method="POST">
                        
                    </form>
                </article>
			</div>
        </div>
    </div>
</body>
</html>

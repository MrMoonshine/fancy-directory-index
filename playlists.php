<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="utf-8">
    <meta lang="de_AT">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/main.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/overlay.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/musicplayer.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/inputs.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/toast.css">
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/playlist.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playlists</title>
</head>
<body class="wallpaper">
    <nav>
        <div class="d-flex flex-nowrap justify-content-between align-items-center nav-container">
            <button id="button-back" class="btn btn-outline big w-unset my-auto d-none cursor-pointer">
                ⤾ Back
            </button>
            <h2 id="main-title" class="overflow-hidden my-auto">Playlsits</h2>
            <div class="d-flex gap">
                <div class="nav-flex-column">
                    <form method="POST" id="form-add" class="d-none">
                        <input type="hidden" name="mode" value="add">
                    </form>
                    <button id="button-add" type="submit" form="form-add" class="btn btn-outline big">
                        <div class="masked-icon"
                            style="mask-image: url('/fdi-icon-theme/actions/22/bookmark-new-list.svg')">
                        </div>
                    </button>
                </div>
                <div class="nav-flex-column">
                    <a href="/" class="btn btn-outline big">
                        <div class="masked-icon" style="mask-image: url('/fdi-icon-theme/actions/22/go-home.svg')">
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <!--<nav class="d-block">
        <div class="d-flex flex-nowrap justify-content-between">
            <div class="d-flex">
                <button id="button-back" class="btn btn-outline big w-unset my-auto d-none cursor-pointer">
                    ⤾ Back
                </button>
            </div>
            <h2 id="main-title" class="overflow-hidden my-auto">Playlsits</h2>
            <div class="d-flex gap">
                <div class="nav-flex-column">
                    <form method="POST" id="form-add" class="d-none">
                        <input type="hidden" name="mode" value="add">
                    </form>
                    <button id="button-add" type="submit" form="form-add" class="btn btn-outline big">
                        <div class="masked-icon"
                            style="mask-image: url('/fdi-icon-theme/actions/22/bookmark-new-list.svg')">
                        </div>
                    </button>
                </div>
                <div class="nav-flex-column">
                    <a href="/" class="btn btn-outline big">
                        <div class="masked-icon" style="mask-image: url('/fdi-icon-theme/actions/22/go-home.svg')">
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </nav>-->
    <article id="dashboard" class="dashboard">
        <input type="checkbox" id="next-up-space-show" class="d-none" autocomplete="off" checked>
        <div class="d-flex gap justify-content-around">
            <div id="playlist-player-content" class="flex-grow-1">
                <div id="playlist-library">
                    <?php
                    require("settings/db.php");

                    //var_dump($_POST);
                    //var_dump($_FILES);
                    
                    $db = new DirectoryDB("settings/" . DirectoryDB::DB_FILE);
                    if (($_POST["mode"] ?? "") == "add") {
                        $db->playlist_create();
                    } else if (isset($_POST["rename"])) {
                        $db->playlist_rename($_POST["rename"] ?? -1, $_POST["name"] ?? "");
                    } else if (isset($_POST["delete"])) {
                        $db->playlist_delete($_POST["delete"] ?? -1);
                    } else if (isset($_POST["playlist"]) && isset($_FILES["image"])) {
                        $db->playlist_image($_POST["playlist"]);
                    }

                    if (count($db->errors) > 0) {
                        echo ("<h3>Errors</h3>");
                        var_dump($db->errors);
                    }

                    $playlists = [];
                    $playlists = $db->playlist_get();

                    $options = $db->options_get();
                    $thumbnailpath = $db->thumbnail_dir2path($options['thumbnaildir']);
                    $db->close();
                    //playlistList($playlists);
                    ?>
                    <div id="playlist-library-cardspace" class="playlist-selection gap">
                    </div>
                    <div id="playlist-song-selection"
                        class="playlist-selection d-flex gap justify-content-center d-none">
                        <div class="playlist-icon-actions gap">
                            <div class="d-flex gap justify-content-center" style="margin-bottom: 8px;">
                                <img id="playlist-meta-image" alt="[IMG]" src="">
                            </div>
                            <div class="actions">
                                <button class="action" disabled="true">Actions:</button>
                                <form id="form-delete" method="POST">
                                    <input id="input-delete-id" name="delete" type="hidden">
                                </form>
                                <form id="form-image" method="POST" enctype="multipart/form-data" class="d-none">
                                    <input id="input-image-id" name="playlist" type="hidden">
                                    <input id="input-image" name="image" type="file">
                                    <input type="submit">
                                </form>
                                <form id="form-delete" method="POST">
                                    <input id="input-delete-id" name="delete" type="hidden">
                                </form>
                                <button id="button-rename" class="action d-flex justify-content-left gap" type="button">
                                    <div class="sillouhette-img">
                                        <div class="masked-icon"
                                            style='mask-image: url("/fdi-icon-theme/actions/22/edit-rename.svg");'>
                                        </div>
                                    </div>
                                    <div>Rename</div>
                                </button>
                                <button id="button-change-image" class="action d-flex justify-content-left gap"
                                    type="button">
                                    <div class="sillouhette-img">
                                        <div class="masked-icon"
                                            style='mask-image: url("/fdi-icon-theme/actions/22/insert-image.svg");'>
                                        </div>
                                    </div>
                                    <div>Change Image</div>
                                </button>
                                <button id="button-delete" class="action d-flex justify-content-left gap" type="button">
                                    <div class="sillouhette-img">
                                        <div class="masked-icon"
                                            style='mask-image: url("/fdi-icon-theme/actions/22/delete.svg");'>
                                        </div>
                                    </div>
                                    <div class="text-critical">Delete Playlist</div>
                                </button>
                            </div>
                        </div>
                        <hr>
                    </div>
                </div>
            </div>
            <div id="next-up-space">
                <h3>Next from: <i class="playlist-title-display">xxx</i></h3>
                <hr>
            </div>
        </div>
    </article>
    <div class="d-block">
        <div class="music-player d-none" id="music-player">
            <input id="cover-container-big-checkbox" type="checkbox">
            <div id="cover-container-big">
                <label for="cover-container-big-checkbox"
                    class="cursor-pointer d-block mx-auto current-album position-relative">
                    <img src="/fancy-directory-index/assets/jewel_case.png" alt="Jewel Case" id="jewelCase">
                    <img src="" id="albumCover" title="Toggle CD">
                    <img src="/fancy-directory-index/assets/cd.png" id="spinningDisk" alt="Spinning disk">
                </label>
            </div>
            <div class="row main text-center d-flex gap align-items-center justify-content-center mx-auto">
                <div>
                    <input type="checkbox" id="shuffle">
                    <label class="playlistcontrol option" for="shuffle">
                        <img id="img-shuffle" alt="" src="/fancy-directory-index/assets/media-playlist-shuffle.png" />
                        <div class="d-desktop">
                            Shuffle
                        </div>
                    </label>
                </div>
                <div class="d-flex flex-column justify-content-center">
                    <label class="playercontrol" id="skip-bck">
                        <img class="hue-rotate-auto red" id="img-skip-bck"
                            src="/fancy-directory-index/assets/media-skip-backward.png">
                    </label>
                </div>
                <div>
                    <input type="checkbox" id="play">
                    <label class="playercontrol" for="play">
                        <img class="hue-rotate-auto red" id="img-play"
                            src="/fancy-directory-index/assets/media-playback-playing.png">
                        <img class="hue-rotate-auto red" id="img-pause"
                            src="/fancy-directory-index/assets/media-playback-paused.png">
                    </label>
                </div>
                <div>
                    <label class="playercontrol" id="skip-fwd">
                        <img class="hue-rotate-auto red" id="img-skip-fwd"
                            src="/fancy-directory-index/assets/media-skip-forward.png">
                    </label>
                </div>
                <div>
                    <input type="checkbox" id="repeat" autocomplete="off">
                    <label class="playlistcontrol option" for="repeat">
                        <img class="hue-rotate-auto blue" id="img-skip-fwd"
                            src="/fancy-directory-index/assets/repeat.svg.png">
                        <div class="d-desktop">
                            Repeat
                        </div>
                    </label>
                </div>
            </div>
            <div class="row">
                <div class="timebar flex-grow-1 justify-content-center">
                    <div id="display-current" class="text-main">
                        0:00
                    </div>
                    <div class="fancy-range flex-grow-1">
                        <span class="loader" id="music-load-indicator"></span>
                        <input class="w-100" type="range" id="music-progress" min="0" max="100" />
                    </div>
                    <div id="display-duration" class="text-main">99:99</div>
                </div>
            </div>
            <div class="row options-row gap">
                <div class="wide">
                    <span>Currently playing: </span>
                    <span id="songtitle" class="text-main">UNKNOWN</span>
                </div>
                <div class="d-flex gap align-items-center">
                    <button class="playlistcontrol " id="mute">
                        <img id="img-unmute" src="/fancy-directory-index/assets/audio-volume.png" alt="">
                        <img id="img-mute" class="d-none" src="/fancy-directory-index/assets/audio-volume-muted.png"
                            alt="">
                    </button>
                    <input id="volume" type="range" min="0" max="1" step="0.1" value="1" />
                    <div class="d-desktop">
                        <span>Volume: </span>
                        <span class="text-main">69</span>
                    </div>
                </div>
                <div class="options-flex d-flex flex-grow-1 gap justify-content-end align-items-center">
                    <button class="action-option" id="song-share" download="file.mp3">
                        <img id="img-share" src="/fancy-directory-index/assets/emblem-shared.svg" alt="">
                    </button>
                    <button class="action-option" id="song-playlist-add">
                        <img id="img-playlist-add" src="/fancy-directory-index/assets/playlist.png" alt="">
                    </button>
                    <a class="action-option" id="song-download" download="file.mp3">
                        <img id="img-download" src="/fancy-directory-index/assets/download.png" alt="">
                    </a>
                </div>
            </div>
        </div>
        <div id="playlist-thumbnailpath"
            data-json="<?= htmlspecialchars(json_encode($thumbnailpath, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div id="playlist-data"
            data-json="<?= htmlspecialchars(json_encode($playlists, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8') ?>">
        </div>
    </div>
    <script src="/fancy-directory-index/js/common.js"></script>
    <script src="/fancy-directory-index/js/api.js"></script>
    <script src="/fancy-directory-index/js/overlay.js"></script>
    <script src="/fancy-directory-index/js/toast.js"></script>
    <script src="/fancy-directory-index/js/musicplayer.js"></script>
    <script src="/fancy-directory-index/js/playlist.js"></script>
</body>
</html>
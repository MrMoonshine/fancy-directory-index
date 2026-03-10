<!DOCTYPE html>
<html lang="de"
    style="--color-main: #780c45; --color-background-translucent: color-mix(in srgb, var(--color-background-2) 70%, transparent);">

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
    <link rel="stylesheet" type="text/css" href="/fancy-directory-index/css/aero.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playlists</title>
</head>

<body>
    <nav class="d-block">
        <div class="d-flex flex-nowrap justify-content-between">
            <div class="d-flex">
                <button id="button-back" class="btn btn-outline big w-unset my-auto d-none cursor-pointer">
                    ⤾ Back
                </button>
            </div>
            <h2 id="main-title" class="overflow-hidden my-auto">Playlsits</h2>
            <div class="d-flex gap">
                <div class="nav-flex-column">
                    <button id="button-add"  type="submit" form="form-add" class="btn btn-outline big">
                        <div class="masked-icon" style="mask-image: url('/fdi-icon-theme/actions/22/bookmark-new-list.svg')">
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
    <article class="dashboard wallpaper">
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
            </div>
        </div>
    </article>
    <div class="d-block">
        <div class="music-player d-none" id="music-player">
            <div class="d-flex flex-nowrap gap">
                <img class="albumcover" id="albumcover" alt="cover">
                <div class="songinfoomini d-flex flex-column justify-content-center">
                    <div id="songtitle">UNKNOWN</div>
                    <!--<div id="songartist">UNKNOWN</div>-->
                </div>
            </div>
            <div class="d-block">
                <div class="musicbuttons d-flex flex-nowrap flex-grow-1 justify-content-center gap">
                    <div class="d-flex flex-column justify-content-center">
                        <input type="checkbox" id="shuffle">
                        <label class="playlistcontrol sillouhette-button" for="shuffle">
                            <!--<img id="img-shuffle" alt="&#x23EE;" src="/fancy-directory-index/assets/shuffle.svg.png" />-->
                            <div class="masked-icon" id="img-shuffle"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-playlist-shuffle.svg')">
                            </div>
                        </label>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <button class="playercontrol" id="skip-bck">
                            <div class="masked-icon" id="img-skip-bck"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-skip-backward.svg')">
                            </div>
                        </button>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <input type="checkbox" id="play">
                        <label class="playercontrol" for="play">
                            <div class="masked-icon" id="img-play"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-playback-start.svg')">
                            </div>
                            <div class="masked-icon" id="img-pause"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-playback-pause.svg')">
                            </div>
                        </label>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <button class="playercontrol" id="skip-fwd">
                            <div class="masked-icon" id="img-skip-fwd"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-skip-forward.svg')">
                            </div>
                        </button>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <input type="checkbox" id="repeat" autocomplete="off">
                        <label class="playlistcontrol sillouhette-button" for="repeat">
                            <div class="masked-icon" id="img-repeat"
                                style="mask-image: url('/fdi-icon-theme/actions/22/media-playlist-repeat.svg')">
                            </div>
                        </label>
                    </div>
                </div>
                <div class="timebar flex-grow-1 justify-content-center">
                    <div id="display-current">0:00</div>
                    <div class="fancy-range flex-grow-1">
                        <span class="loader" id="music-load-indicator"></span>
                        <input type="range" id="music-progress" min="0" max="100" />
                    </div>
                    <div id="display-duration">99:99</div>
                </div>
            </div>
            <div class="options-flex d-flex gap">
                <div class="d-flex justify-content-end gap">
                    <button class="sillouhette-button" id="song-share" download="file.mp3">
                        <div class="masked-icon" id="img-share"
                            style="mask-image: url('/fdi-icon-theme/actions/22/document-share.svg')">
                        </div>
                    </button>
                    <label class="sillouhette-button" for="next-up-space-show">
                        <div class="masked-icon"
                            style="mask-image: url('/fdi-icon-theme/actions/22/amarok_playlist.svg')">
                        </div>
                    </label>
                    <button class="sillouhette-button" id="song-playlist-add">
                        <div class="masked-icon" id="img-playlist-add"
                            style="mask-image: url('/fdi-icon-theme/actions/22/bookmarks.svg')">
                        </div>
                    </button>
                    <a class="sillouhette-button" id="song-download" download="file.mp3">
                        <div class="masked-icon" id="img-download"
                            style="mask-image: url('/fdi-icon-theme/actions/22/download.svg')">
                        </div>
                    </a>
                </div>
                <div class="d-flex justify-content-end">
                    <div class="d-flex flex-column justify-content-center">
                        <button class="playlistcontrol sillouhette-button" id="mute">
                            <div class="masked-icon" id="img-unmute"
                                style="mask-image: url('/fancy-directory-index/assets/speaker.svg')">
                            </div>
                            <div class="masked-icon d-none" id="img-mute"
                                style="mask-image: url('/fancy-directory-index/assets/speaker_mute.svg')">
                            </div>
                        </button>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <input id="volume" type="range" min="0" max="1" step="0.1" value="1" />
                    </div>
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
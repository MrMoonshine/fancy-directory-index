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

<body class="aero">
    <div class="playlist-player">
        <header>
            <div>
                <span id="button-back" class="d-none cursor-pointer">
                    <img class="hue-rotate" style="transform: scaleX(-1)" alt="PLAY"
                        src="/fancy-directory-index/assets/media-playback-playing.png">
                </span>
            </div>
            <h2 id="main-title">Playlsits</h2>
            <div class="d-flex">
                <form method="POST" class="d-none" id="form-add">
                    <input type="text" name="resource" value="playlists">
                    <input type="text" name="mode" value="add">
                </form>
                <button id="button-add" class="btn btn-success my-auto" type="submit" form="form-add">Add +</button>
                <button id="button-edit" class="btn btn-warning my-auto d-none">Edit</button>
            </div>
        </header>
        <article>
            <input type="checkbox" id="next-up-space-show" class="d-none" autocomplete checked>
            <div class="aero-glass d-flex gap justify-content-around">
                <div id="playlist-player-content" class="flex-grow-1">
                    <div id="playlist-library">
                        <?php
                        require("settings/db.php");

                        //var_dump($_POST);
                        
                        $db = new DirectoryDB("settings/" . DirectoryDB::DB_FILE);
                        if (($_POST["mode"] ?? "") == "add") {
                            $db->playlist_create();
                        }

                        $playlists = [];
                        $playlists = $db->playlist_get();
                        //playlistList($playlists);
                        ?>
                        <div id="playlist-library-cardspace" class="playlist-selection gap justify-content-center">
                        </div>
                        <div id="playlist-song-selection" class="playlist-selection d-flex gap justify-content-center">
                            <div class="d-flex gap justify-content-center" style="margin-bottom: 8px;">
                                <img id="playlist-meta-image" alt="[IMG]" src="">
                            </div>
                            <div class="d-flex gap justify-content-center">
                                    <button class="btn btn-dull d-flex justify-content-left gap" type="button">
                                        <img class="my-auto" alt="" src="/fancy-directory-index/assets/edit-rename.png">
                                        <div class="my-auto">Rename</div>
                                    </button>
                                    <button class="btn btn-dull d-flex justify-content-left gap">
                                        <img class="my-auto" alt="" src="/fancy-directory-index/assets/edit-delete.png">
                                        <div class="my-auto text-critical">Delete</div>
                                    </button>
                                </div>
                            <hr>
                        </div>
                    </div>
                </div>
                <div id="next-up-space">
                    <h3>Next from: <i class="playlist-title-display">xxx</i></h3>
                </div>
            </div>
            <div>
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
                                        style="mask-image: url('/fancy-directory-index/assets/shuffle.svg.png')">
                                    </div>
                                </label>
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                                <button class="playercontrol" id="skip-bck">
                                    <div class="masked-icon" id="img-skip-bck"
                                        style="mask-image: url('/fancy-directory-index/assets/skip_bck.svg.png')">
                                    </div>
                                </button>
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                                <input type="checkbox" id="play">
                                <label class="playercontrol" for="play">
                                    <div class="masked-icon" id="img-play"
                                        style="mask-image: url('/fancy-directory-index/assets/play.svg.png')">
                                    </div>
                                    <div class="masked-icon" id="img-pause"
                                        style="mask-image: url('/fancy-directory-index/assets/pause.svg.png')">
                                    </div>
                                    </lable>
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                                <button class="playercontrol" id="skip-fwd">
                                    <div class="masked-icon" id="img-skip-fwd"
                                        style="mask-image: url('/fancy-directory-index/assets/skip_fwd.svg.png')">
                                    </div>
                                </button>
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                                <input type="checkbox" id="repeat" autocomplete="off">
                                <label class="playlistcontrol sillouhette-button" for="repeat">
                                    <div class="masked-icon" id="img-repeat"
                                        style="mask-image: url('/fancy-directory-index/assets/repeat.svg.png')">
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
                                    style="mask-image: url('/fancy-directory-index/assets/share.svg')">
                                </div>
                            </button>
                            <button class="sillouhette-button" id="song-playlist-add">
                                <div class="masked-icon" id="img-playlist-add"
                                    style="mask-image: url('/fancy-directory-index/assets/bookmarks.svg')">
                                </div>
                            </button>
                            <label for="next-up-space-show" class="cursor-pointer sillouhette-button">
                                <img class="icon" src="/fancy-directory-index/assets/format-list-unordered.png"
                                    alt="queue" />
                            </label>
                            <a class="sillouhette-button" id="song-download" download="file.mp3">
                                <div class="masked-icon" id="img-download"
                                    style="mask-image: url('/fancy-directory-index/assets/download.svg')">
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
            </div>
        </article>
        <footer></footer>
    </div>
    <div id="playlist-data"
        data-json="<?= htmlspecialchars(json_encode($playlists, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8') ?>"></div>
    <script src="/fancy-directory-index/js/common.js"></script>
    <script src="/fancy-directory-index/js/api.js"></script>
    <script src="/fancy-directory-index/js/overlay.js"></script>
    <script src="/fancy-directory-index/js/toast.js"></script>
    <script src="/fancy-directory-index/js/musicplayer.js"></script>
    <script src="/fancy-directory-index/js/playlist.js"></script>
</body>

</html>
<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    chdir("..");
    $documentRoot = getcwd();

    function handleGif($filename){
        if(file_exists($filename)){
            $im = @imagecreatefromgif($filename);
            if(!$im){
                return $errorUrl;
            }else{
                // Output the image to browser
                header('Content-Type: image/gif');
                // display
                imagegif($im);
                imagedestroy($im);
            }
        }else{
            return false;
        }
        return true;
    }

    function handlePng($filename){
        if(file_exists($filename)){
            $im = @imagecreatefrompng($filename);
            if(!$im){
                return false;
            }else{
                // Output the image to browser
                header('Content-Type: image/png');
                // scale down to 512px width
                $im = imagescale($im, 512);
                // display
                imagepng($im);
                imagedestroy($im);
            }
        }else{
            echo("File doesnt exist");
            return false;
        }
        return true;
    }

    function handleJpeg($filename){
        if(file_exists($filename)){
            $im = @imagecreatefromjpeg($filename);
            if(!$im){
                return false;
            }else{
                // Output the image to browser
                header('Content-Type: image/jpeg');
                // scale down to 512px width
                $im = imagescale($im, 512);
                // display
                imagejpeg($im);
                imagedestroy($im);
            }
        }else{
            echo("File doesnt exist");
            return false;
        }
        return true;
    }

    function handleVideo($documentRoot){
        $filename = $documentRoot.$_GET["file"];
        if(file_exists($filename)){
            
        }else{
            return false;
        }
        return true;
    }
    
    if(!isset($_GET["file"])){
        die("No file specified!");
    }

    $file = substr($_GET["file"], strlen("/gia"));
    $file = $documentRoot.$file;

    if(str_ends_with($_GET["file"], ".gif")){
        handleGif($file);
    }else if(str_ends_with($_GET["file"], ".png")){
        handlePng($file);
    }else if(str_ends_with($_GET["file"], ".jpg") or str_ends_with($_GET["file"], ".jpeg")){
        handleJpeg($file);
    }else{
        $output=null;
        $retval=null;

        $timeOffset = 1;
        $outfile = "/var/www/html/assets/oida.jpg";
        exec("ffmpeg -i $file -ss $timeOffset -vframes 1 $outfile", $output, $retval);
        var_dump($output);
        var_dump($retval);
    }
?>
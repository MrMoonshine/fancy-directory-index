
<?php

abstract class UploadError
{
  const OK = "OK";
  const ERR_NONE = "No File.";
  const ERR_FILETYPE = "Wrong Filetype!";
  const ERR_SIZE = "File is too big!";
  const ERR_SCALE_DOWN = "File can't be scaled down!";
  const ERR_DUPLICATE = "Duplicate file!";
  const ERR_UNKNOWN = "Unknown error";
}

abstract class UploadMimetype
{
  const IMAGE = ["png", "jpg", "jpeg", "gif", "webp", "jfif"];
  const TAR_GZ = ["tar.gz", "gz"];
}

function convertAndResize($in, $out, $mime)
{
  $retval = [
    "status" => 0,
    "scale" => 1.0,
    "error" => ""
  ];
  $img = false;
  switch (strtolower($mime)) {
    case "png": {
        $img = imagecreatefrompng($in);
      }
      break;
    case "jpg": {
        $img = imagecreatefromjpeg($in);
      }
      break;
    case "jpeg": {
        $img = imagecreatefromjpeg($in);
      }
      break;
    case "webp": {
        $img = imagecreatefromwebp($in);
      }
      break;
    default: {
        $retval['status'] = -1;
        $retval['error'] = 'Nicht Unterstützter Mime-Type: "' . $mime . '"';
        return $retval;
      }
      break;
  }
  if ($img == false) {
    //echo ("Failed to create Image from " . $in . "<br>");
    $retval['status'] = -1;
    $retval['error'] = "Failed to create Image from " . $in;
    return $retval;
  }

  $width = imagesx($img);
  $height = imagesy($img);
  $factor = 1;
  $targetSize = 512;
  if ($width < $targetSize && $height < $targetSize) {
    $factor = 1;
  } else if ($width / $targetSize > $height / $targetSize) {
    $factor = $targetSize / $height;
  } else {
    $factor = $targetSize / $width;
  }

  $retval['scale'] = floatval($factor);

  if ($factor < 1) {
    $resized = imagescale($img, $width * $factor, $height * $factor);
    if ($resized) {
      if (!imagewebp($resized, $out, 80)) {
        $retval['status'] = -1;
        $retval['error'] = "Image Create Error!" . $in;
      }
      return $retval;
    }
    $retval['status'] = 1;
    $retval['error'] = "Resize Error" . $in;
  }

  if (!imagewebp($img, $out, 80)) {
    $retval['status'] = -1;
    $retval['error'] = "Image Create Error!" . $in;
  }
  return $retval;
  //imagedestroy($img);
  return $retval;
}
// ift = ist-filetype, sft = soll-filetype[UploadMimetype]
function verfiyMimeType($ift, $sft)
{
  $matches = 0;
  for ($i = 0; $i < count($sft); $i++) {
    if (strtolower($ift) == strtolower($sft[$i])) {
      $matches++;
    }
  }
  return $matches > 0;
}

function uploadFile($pname, $target_dir, $mimetype = UploadMimetype::IMAGE, $target_filename = "")
{
  $retval = [
    "status" => -1,
    "error" => UploadError::OK
  ];

  //var_dump($_FILES);
  //$upload_err = UploadError::OK;
  if (strlen(basename($_FILES[$pname]["name"])) < 1) {
    $retval['error'] = UploadError::ERR_NONE;
    return $retval;
  }

  $target_file = $target_dir . basename($_FILES[$pname]["name"]);
  //Get MIME type
  $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

  //Check Image
  if (isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if ($check !== false) {
      //$upload_err = UploadError::OK;
      $retval['error'] = UploadError::OK;
    } else {
      //$upload_err = UploadError::ERR_FILETYPE;
      $retval['error'] = UploadError::ERR_FILETYPE;
    }
  }

  // Check if file already exists
  if (file_exists($target_file)) {
    //$upload_err = UploadError::ERR_DUPLICATE;
    $retval['error'] = UploadError::ERR_DUPLICATE;
    return $retval;
  }

  // Allow certain file formats
  if (1 > verfiyMimeType($imageFileType, $mimetype)) {
    //$upload_err = UploadError::ERR_FILETYPE;
    $retval['error'] = UploadError::ERR_FILETYPE;
    return $retval;
  }

  if ($retval['error'] != UploadError::OK) {
    return $retval;
    // if everything is ok, try to upload file
  } else {
    if (move_uploaded_file($_FILES[$pname]["tmp_name"], $target_file)) {
      error_log("<p>The file " . htmlspecialchars(basename($_FILES[$pname]["name"])) . " has been uploaded to " . $target_file . "</p>", 1);
      $retval['error'] = UploadError::OK;
      $retval['status'] = 0;
    } else if ($_FILES[$pname]["error"] == 1) {
      $retval['error'] = UploadError::ERR_SIZE;
    } else {
      $retval['error'] = UploadError::ERR_UNKNOWN;
    }
  }
  return $retval;
}
?>
# fancy-directory-index
Apache2 fancy directory index.

## Features
- Gallery & File-List Views
- Preview for images, PDFs, audio, video and various text files.
- Auto-Thumbnail generation for videos
- File Search in current directory
- Theme customization


## Setup
- **Permissions** - Theese permissions are necessary to set, to allow creating and maintaining a little database for configuration
    - `cd fancy-directory-index/`
    - For Debain-Like Systems:
    `chown www-data:www-data -R .`
    - `chmod 775 -R .`
- **Aliases** - Aliases need to be entered manually. Can be done from GUI at Admin-Settings.

## Video-Thumbnails
- By default thumbnails will be saved to the working `fancy-directory-index/settings/data`. Can be changed from GUI at Admin-Settings. It is also aware of aliases if configured

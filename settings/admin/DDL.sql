-- Table with all the options
CREATE TABLE IF NOT EXISTS options(
    "id" INTEGER,
    "name" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- Table with video directories
CREATE TABLE IF NOT EXISTS directries(
    "id" INTEGER,
    "pathname" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- Table with video thumbnails
CREATE TABLE IF NOT EXISTS thumbnails(
    "id" INTEGER,
    "filename" TEXT NOT NULL,
    "directory" INTEGER NOT NULL,
    "videofile" TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- Table with video aliases
CREATE TABLE IF NOT EXISTS aliases(
    "id" INTEGER,
    "aliasname" TEXT NOT NULL,
    "directory" INTEGER NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

-- Initial DMLs
INSERT INTO "options" ("name", "value") VALUES ("docroot", "/var/www/html/");
INSERT INTO "options" ("name", "value") VALUES ("pageicon", "/favicon.ico");
INSERT INTO "options" ("name", "value") VALUES ("thumbnailgen", "off");
INSERT INTO "options" ("name", "value") VALUES ("thumbnaildir", "/fancy-directory-index/settings/data/");
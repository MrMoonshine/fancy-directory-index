-- Table with all the options
CREATE TABLE IF NOT EXISTS options(
    "id" INTEGER,
    "name" TEXT NOT NULL,
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
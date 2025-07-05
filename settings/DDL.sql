-- Table with all the options
CREATE TABLE IF NOT EXISTS options(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    value TEXT NOT NULL
);

-- Table with video directories
CREATE TABLE IF NOT EXISTS directries(
    id INTEGER PRIMARY KEY,
    pathname TEXT NOT NULL
);

-- Table with video thumbnails
CREATE TABLE IF NOT EXISTS thumbnails(
    id INTEGER PRIMARY KEY,
    filename TEXT NOT NULL,
    directory INTEGER NOT NULL
);
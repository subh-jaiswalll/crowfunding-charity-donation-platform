const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Create the logs folder if it does not exist
const logDirectory = path.join(__dirname, "../logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a writable stream to store logs
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// Save HTTP request logs to the file
const logger = morgan("combined", {
  stream: accessLogStream,
});

module.exports = logger;
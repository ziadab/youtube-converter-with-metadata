const argv = require("yargs").argv;
const axios = require("axios");
const ID3Writter = require("browser-id3-writer");
const fs = require("fs");

const file = argv.file;
var artist = argv.artist;
var track = argv.track;
var id = argv.id;
console.log([file, artist, track, id]);

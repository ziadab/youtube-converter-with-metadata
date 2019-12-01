const argv = require("yargs").argv;
const axios = require("axios");
const ID3Writer = require("browser-id3-writer");
const fs = require("fs");
const readline = require("readline-sync");

const file = argv.file;
var artist = argv.artist.trim();
var track = argv.track.trim();
const type = argv.type.trim();
const youtube_title = argv.youtubeTitle.trim();
var trying = 0;

async function getBuffer(link) {
  return axios
    .get(link, { responseType: "arraybuffer" })
    .then(response => Buffer.from(response.data, "binary"));
}

async function main() {
  // create output folder
  fs.mkdirSync("songs", { recursive: true });

  // getting data
  const link = encodeURI(`https://api.deezer.com/search?q=${artist} ${track}`);
  const res = await axios.get(link);

  // check of res bcs it giving me headache in test
  const data = res.data.data[0];
  const total = res.data.total;

  if (total > 0) {
    // checking images
    let coverPath;
    if (!data.album.hasOwnProperty("picture")) {
      if (!data.album.hasOwnProperty("cover_xl")) {
        coverPath = data.album.cover_xl;
      } else {
        coverPath = data.album.cover_medium; // dfntly exsists (thts bad)
      }
    }

    // Sure that will not change between track and album
    const coverBuffer = await getBuffer(coverPath);
    const songBuffer = fs.readFileSync(file);
    const artisto = data.artist.name;
    const albumName = data.album.title;

    // ALbum Taking album title or track title
    let title;
    if (type == "track") {
      title = data.title;
    } else {
      title = data.album.title;
    }

    const writer = new ID3Writer(songBuffer);
    writer
      .setFrame("APIC", {
        type: 3,
        data: coverBuffer,
        description: "https://github.com/ziadab"
      })
      .setFrame("TIT2", title)
      .setFrame("TALB", albumName)
      .setFrame("TPE1", [artisto]);

    writer.addTag();
    const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
    fs.writeFile(
      `./songs/${artisto.replace(/[^\w\s]/gi, "")} - ${title.replace(
        /[^\w\s]/gi,
        ""
      )}.mp3`,
      taggedSongBuffer,
      err => {
        if (err) throw err;
      }
    );

    fs.unlinkSync(file);
  } else {
    console.log("Sorry I couldn't find artist and track in title");
    console.log("So can u give it to me please");
    artist = readline.question("Artist Name: ").trim();
    track = readline.question("Track Name: ").trim();
    ++trying;
    main();
  }
}

main();

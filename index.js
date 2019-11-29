const argv = require("yargs").argv;
const axios = require("axios");
const ID3Writer = require("browser-id3-writer");
const fs = require("fs");

const file = argv.file;
var artist = argv.artist.trim();
var track = argv.track.trim();
//console.log([file, artist, track]);

async function getBuffer(link) {
  return axios
    .get(link, { responseType: "arraybuffer" })
    .then(response => Buffer.from(response.data, "binary"));
}

async function main() {
  const link = `https://api.deezer.com/search?q=${artist} ${track}`;
  const res = await axios.get(link);
  //console.log(link);
  const data = res.data.data[0];

  let coverPath;
  if (!data.album.hasOwnProperty("picture")) {
    if (!data.album.hasOwnProperty("cover_xl")) {
      coverPath = data.album.cover_xl;
    } else {
      coverPath = data.album.cover_medium; // dfntly exsists (thts bad)
    }
  }

  const title = data.title;
  const artisto = data.artist.name;
  const albumName = data.album.title;
  const coverBuffer = await getBuffer(coverPath);
  const songBuffer = fs.readFileSync(file);

  const writer = new ID3Writer(songBuffer);
  writer
    .setFrame("APIC", {
      type: 3,
      data: coverBuffer,
      description: "Super picture"
    })
    .setFrame("TIT2", title)
    .setFrame("TALB", albumName)
    .setFrame("TPE1", [artisto]);

  writer.addTag();
  const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
  fs.writeFile(
    `${artisto.replace(/[^\w\s]/gi, "")} - ${title.replace(
      /[^\w\s]/gi,
      ""
    )}.mp3`,
    taggedSongBuffer,
    err => {
      if (err) throw err;
    }
  );

  fs.unlinkSync(file);
}

main();

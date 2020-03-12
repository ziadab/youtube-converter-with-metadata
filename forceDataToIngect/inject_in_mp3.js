const ID3Writer = require("browser-id3-writer");
const fs = require("fs");
const readline = require("readline-sync");
const getBuffer = require("../helpers/getBuffer");

const hell = async () => {
  const songPath = readline.question("Song Path: ");
  const songName = readline.question("Song Name: ").trim();
  const albumName = readline.question("Album Name: ").trim();
  const artistName = readline.question("Artist Name: ").trim();
  const albumCover = readline.question("Cover link: ").trim();

  const coverBuffer = await getBuffer(albumCover);
  const songBuffer = fs.readFileSync(songPath);

  const writer = new ID3Writer(songBuffer);
  writer
    .setFrame("APIC", {
      type: 3,
      data: coverBuffer,
      description: "https://github.com/ziadab"
    })
    .setFrame("TIT2", songName)
    .setFrame("TALB", albumName)
    .setFrame("TPE1", [artistName]);

  writer.addTag();

  const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
  var artist_name = artistName[0].replace(/[^\w\s]/gi, "").trim();
  var title_name = songName.replace(/[^\w\s]/gi, "").trim();

  if (artist_name == "") {
    artist_name = Math.random()
      .toString(36)
      .substring(7);
  }

  if (title_name == "") {
    title_name = Math.random()
      .toString(36)
      .substring(7);
  }

  fs.writeFile(
    `../songs/${artist_name} - ${title_name}.mp3`,
    taggedSongBuffer,
    err => {
      if (err) throw err;
    }
  );

  fs.unlinkSync(songPath);
};

hell();

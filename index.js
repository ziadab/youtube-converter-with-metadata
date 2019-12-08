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
  const link = encodeURI(
    `https://spotify-grabber.herokuapp.com/?title=${artist} ${track}&type=${type}`
  );
  const res = await axios.get(link);

  // check of res bcs it giving me headache in test
  // const data = res.data.data[0];
  // const total = res.data.total;
  const data = res.data;
  const status = res.status;

  if (status == 200) {
    // Sure that will not change between track and album
    const coverBuffer = await getBuffer(data.albumCover);
    const songBuffer = fs.readFileSync(file);
    const artist = data.artists;
    const albumName = data.albumName;
    const title = data.title;
    const [year, mounth, day] = data.releaseDay.split("-");

    const writer = new ID3Writer(songBuffer);
    writer
      .setFrame("APIC", {
        type: 3,
        data: coverBuffer,
        description: "https://github.com/ziadab"
      })
      .setFrame("TIT2", title)
      .setFrame("TALB", albumName)
      .setFrame("TPE1", artist)
      .setFrame("TYER", parseInt(year))
      .setFrame("TRCK", `${day}/${mounth}`);

    writer.addTag();
    const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
    fs.writeFile(
      `./songs/${artist[0].replace(/[^\w\s]/gi, "")} - ${title.replace(
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
    if (trying == 0) {
      console.log("Sorry I couldn't find artist and track in title");
      console.log("So can u give it to me please");
      artist = readline.question("Artist Name: ").trim();
      track = readline.question("Track Name: ").trim();
      trying++;
      main();
    } else {
      console.log("Sorry nothing mush :'(");
      fs.writeFileSync(`${youtube_title}.mp3`, songBuffer);
      fs.unlinkSync(file);
    }
  }
}

main();

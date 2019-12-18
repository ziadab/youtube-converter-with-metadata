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

async function checkData() {
  console.log(
    `Are this the real data\ntitle = ${track}\nartist = ${artist}\ntype = ${type.toUpperCase()}`
  );
  const anwser = readline.question("[y/n]: ").toLowerCase();
  if (anwser === "y") {
    continue;
  } else if (anwser === "n") {
    track = readline.question("Song name: ").trim();
    artist = readline.question("Artist name: ").trim();
    type = readline.question("Type of the song: ").trim();
  } else {
    console.log("Sadlly I can't continue wihout checking data");
    fs.unlinkSync(file);
    return process.exit(1);
  }
}

async function getBuffer(link) {
  return axios
    .get(link, { responseType: "arraybuffer" })
    .then(response => Buffer.from(response.data, "binary"));
}

async function main() {
  // cleaning interface
  process.stdout.write("\u001b[H\u001b[2J\u001b[3J");

  process.on("SIGINT", () => {
    fs.unlinkSync(file);
  });

  // checking data
  console.log(
    `Are this the real data\nTitle: ${track}\nArtist: ${artist}\nType: ${type.toUpperCase()}`
  );
  const anwser = readline.question("[y/n]: ").toLowerCase();
  if (anwser === "y") {
  } else if (anwser === "n") {
    track = readline.question("Song name: ").trim();
    artist = readline.question("Artist name: ").trim();
  } else {
    console.log("Sadlly I can't continue wihout checking data");
    fs.unlinkSync(file);
    return process.exit(1);
  }

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
    var artist_name = artist[0].replace(/[^\w\s]/gi, "").trim();
    var title_name = title.replace(/[^\w\s]/gi, "").trim();

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
      `./songs/${artist_name} - ${title_name}.mp3`,
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

const app = require("express")();
const axios = require("axios");

app.get("/", async (req, res) => {
  const data = await axios.get(
    "https://spotify-grabber.herokuapp.com/?title=phoenix league of legends&type=track"
  );
  console.log(data.status);
  res.json({ lol: data.status });
});

app.listen(3000, () => {
  console.log("Hmmm");
});

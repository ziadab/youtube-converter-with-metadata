const axios = require("axios");

async function getBuffer(link) {
  return axios
    .get(link, { responseType: "arraybuffer" })
    .then(response => Buffer.from(response.data, "binary"));
}

module.exports = getBuffer;

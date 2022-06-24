//Setup cheerio and axios
const cheerio = require("cheerio");
const axios = require("axios");
const url = "http://fluxradios.blogspot.com/p/flux-radios-francaise.html";

const express = require("express");
const app = express();
const port = 3320;

app.get("/", async (req, res) => {
  res.send(await getAll());
});

//app get with parameter "title"
app.get("/:title", async (req, res) => {
    console.log(req.params.title);
    res.send(await getByTitle(req.params.title));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//fetch url with axios async/await
async function getAll() {
  const $ = cheerio.load(await fetch());
  const radios = [];
  $(".post-body a").each(function (i, elem) {
    if (!($(elem).text().length === 0) && !($(elem).attr("href")[0] === "#")) {
      radios.push({
        title: $(elem).text(),
        link: $(elem).attr("href"),
      });
    }
  });
  return radios;
}

//async function fetching axios with error handling
async function fetch() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function getByTitle(title) {
    const $ = cheerio.load(await fetch());
    const radios = await getAll();
    return radios.filter((radio) => radio.title.toLowerCase().includes(title.toLowerCase()));
}
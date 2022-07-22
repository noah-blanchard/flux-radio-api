//Setup cheerio and axios
const cheerio = require("cheerio");
const axios = require("axios");
const url = "http://fluxradios.blogspot.com/p/flux-radios-francaise.html";

const express = require("express");
const app = express();
const port = 3320;

// get endpoints

app.get("/", async (req, res) => {
  res.send(await getAll());
});

app.get("/:title", async (req, res) => {
    res.send(await getByTitle(req.params.title));
});

app.get("/:year/:num/:htm", async (req, res) => {
  const link = "http://fluxradios.blogspot.com/" + req.params.year + "/" + req.params.num + "/" + req.params.htm;
  res.send(await getRadioInfos(link));
})

// get endpoints functions

async function getAll() {
  const $ = cheerio.load(await fetchAll());
  const radios = [];
  $(".post-body a").each(function (i, elem) {
    if (!($(elem).text().length === 0) && !($(elem).attr("href")[0] === "#")) {
      radios.push({
        title: $(elem).text(),
        link: $(elem).attr("href"),
        path: $(elem).attr("href").split("/")[3]
      });
    }
  });
  return radios;
}

async function getByTitle(title) {
  const $ = cheerio.load(await fetchAll());
  const radios = await getAll();
  return radios.filter((radio) => radio.title.toLowerCase().includes(title.toLowerCase()));
}

async function getRadioInfos(link){
  const $ = cheerio.load(await fetchRadio(link));
  return {quality: "unkown", link:$("tr > td > span > span").first().text()};
}

// axios fetch to get the content of the page

async function fetchAll() {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function fetchRadio(link) {
  try {
    const response = await axios.get(link);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

// start the server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

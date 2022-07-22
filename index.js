//Setup cheerio and axios
const cheerio = require("cheerio");
const axios = require("axios");
const url = "http://fluxradios.blogspot.com/p/flux-radios-francaise.html";
const cache = require("memory-cache");

const express = require("express");
const app = express();
const port = 3320;

const updateCache = async (content) => {
  cache.clear();
  cache.put("radios", content, 1000 * 60 * 60);
}

//update cache every hour
setInterval(async () => {
  console.log("Cache updated automatically at : " + new Date());
  updateCache(await getAll());
}
  , 1000 * 60 * 60);

app.get("/", async (req, res) => {
  res.send(await getAll());
});

app.get("/:title", async (req, res) => {
  res.send(await getByTitle(req.params.title));
});

app.get("/:year/:num/:htm", async (req, res) => {
  const path = req.params.year + "/" + req.params.num + "/" + req.params.htm;
  const link = "http://fluxradios.blogspot.com/" + path;
  res.send(await getRadioInfos(link, path));
})

// get endpoints functions

async function getAll() {

  let radios = cache.get("radios");
  if (radios.length > 0) {
    return radios;
  }
  console.log("Cache not found, fetching from internet and updating cache : " + new Date());
  radios = [];
  const $ = cheerio.load(await fetchAll());
  $(".post-body a").each(function (i, elem) {
    if (!($(elem).text().length === 0) && !($(elem).attr("href")[0] === "#")) {
      radios.push({
        title: $(elem).text(),
        link: $(elem).attr("href"),
        path: $(elem).attr("href").split("/")[3] + "/" + $(elem).attr("href").split("/")[4] + "/" + $(elem).attr("href").split("/")[5],
      });
    }
  });
  await updateCache(radios);
  return radios;
}

async function getByTitle(title) {
  const radios = cache.get("radios");
  if (!radios) {
    console.log("Cache not found, fetching from internet and updating cache : " + new Date());
    const $ = cheerio.load(await fetchAll());
    radios = await getAll();
    await updateCache(radios);
  }
  return radios.filter((radio) => radio.title.toLowerCase().includes(title.toLowerCase()));

}

async function getRadioInfos(link, path) {
  const $ = cheerio.load(await fetchRadio(link));
  return { quality: "unkown", link: ($("tr > td > span > span").first().text()).replace(/\s/g, ""), path: path, title: ($(".post-body >  table > tbody > tr > td > b > span > span").first().text()).replace(/\s/g, "") };
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

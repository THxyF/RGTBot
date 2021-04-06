const yurl = "https://www.youtube.com/";
const ytdl = require("ytdl-core");
const fetch = require("node-fetch");

exports.searchList = async url => {
  let content = await fetch(url).then(res => res.text());
  let tit = content
    .match(/watch\?v=.*?\"/g)
    .map(e =>
      ytdl.getURLVideoID(
        decodeURIComponent(JSON.parse(`"${yurl + e.slice(0, e.length - 1)}"`))
      )
    );

  tit = tit.filter(url => ytdl.validateID(url));
  console.log(tit);

  return tit;
};

exports.searchVideo = async (req, options = {}) => {
  let url = yurl + "results?search_query=" + encodeURIComponent(req.join("+"));

  let content = await fetch(url).then(res => res.text());
  let tit = content
    .match(/watch\?v=.*?\"/g)
    .map(e =>
      ytdl.getURLVideoID(
        decodeURIComponent(JSON.parse(`"${yurl + e.slice(0, e.length - 1)}"`))
      )
    );

  tit = tit.filter(url => ytdl.validateID(url));

  if (options.limit !== undefined) tit = tit.slice(0, options.limit);

  console.log(tit);
  return tit;
};

exports.validateListURL = (url) => {
  let id = url.match(/playlist\?list=.*/g);

  if(id === null)return false;
  
  return id[0].length === 48;
}

exports.getURLListID = (url) => {
  return url.match(/playlist\?list=.*/g)[0].slice(14, 49);
}
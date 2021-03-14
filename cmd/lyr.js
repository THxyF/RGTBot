const fetch = require("node-fetch");
exports.cMain = async function cMain(arg, msg) {
  let content = await fetch(
    `https://petitlyrics.com/search_lyrics?title=${encodeURIComponent(
      arg[0]
    )}&artist=`
  ).then(res => res.text());

  //console.log(content);

  let out = content.match(/<a href="\/lyrics\/[0-9]+">/g);
  let tit = content.match(/<span class="lyrics-list-title">.*<\/span>/g);
  let url = [];
  let title = [];
  out.forEach(o => {
    url.push("https://petitlyrics.com" + o.substring(9, o.length - 2));
  });
  tit.forEach(t => {
    t = t.substring(32, t.length - 8);
    let ti = t.split(";");
    ti.forEach((t1, i) => {
      if (/^\&\#[0-9]+/.test(t1))
        ti[i] = String.fromCodePoint(t1.substring(2, ti.length - 1));
    });
    ti = ti.join("");
    title.push(ti);
  });

  let lyrics = await fetch(url[0]).then(res => res.text());

  lyrics = lyrics.match(/<canvas id="lyrics">[\s\S]*<\/canvas>/g);
  let lyric = lyrics[0];

  //console.log(lyric);
  lyric = lyric.substring(20, lyric.length - 9);
  //console.log(lyric);
  lyrics = lyric.split("\n");
  //console.log(lyrics);

  lyrics.forEach((l, j) => {
    while (true) {
      var n = l.indexOf("&#");
      var m = l.indexOf(";");

      console.log(`n:${n},m:${m}`);
      if (n === -1 || n >= m) break;

      if (n === 0) {
        l = String.fromCharCode(l.slice(n + 2, m)) + l.slice(m + 1, l.length);
      } else {
        l =
          l.slice(0, n) +
          String.fromCharCode(l.slice(n + 2, m)) +
          l.slice(m + 1, l.length);
      }
    }
    lyrics[j] = l;
  });
  lyric = lyrics.join("\n");
  console.log(lyric);
  console.log(url[0]);
  console.log(title[0]);
  msg.channel.send(lyric);
};

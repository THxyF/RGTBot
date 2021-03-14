const fetch = require("node-fetch");
const util = require("../func/util.js");

const voiceKey = "566a1316024a4563bb6cdf4907a39cf9";

const yahooId = "dj00aiZpPVIxQlhNY0xKbUhDbiZzPWNvbnN1bWVyc2VjcmV0Jng9NmE-";

exports.cMain = async function cMain(arg, msg) {
  let req1 = `https://jlp.yahooapis.jp/MAService/V1/parse?appid=${yahooId}&results=ma&sentence=${encodeURIComponent(
    arg.join(" ")
  )}&response=reading`;

  let content = "";

  await fetch(req1)
    .then(res => res.text())
    .then(res =>
      res
        .match(/<reading>.*?<\/reading>/g)
        .forEach(el => (content += el.slice(9, el.length - 10)))
    );

  await util.sleep(500);

  let req2 = `http://api.voicerss.org/?key=${voiceKey}&hl=ja-jp&c=MP3&src=${encodeURIComponent(
    content
  )}`;

  //msg.channel.send({ files: [{ attachment: req2, name: `voice.mp3` }] });
  if (msg.member.voice) {
    msg.member.voice.channel
      .join()
      .then(connection => {
        const dispatcher = connection.play(req2);
        dispatcher.on("error", reason => {
          connection.disconnect();
          connection.channel.leave();
          console.log("err:" + reason);
        });
        dispatcher.on("speaking", val => {
          if(val === 0){
            connection.disconnect();
            connection.channel.leave();
          }
        });
      })
      .catch(console.log);
    return;
  }
};

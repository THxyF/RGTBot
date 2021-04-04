const consts = require("../../func/const.js");
const func = require("../../func/nabla.js");
const fs = require("fs");

const gameDatPath = "./json/nabla/gameDat.json";
const srcPath = "./json/nabla/src.json";

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(gameDatPath, "utf8"));
    let src = JSON.parse(fs.readFileSync(srcPath, "utf8"));

    let index = gameDat.games.findIndex(
      game => game.guildId === msg.guild.id && game.channelId === msg.channel.id
    );
    let player = Number(msg.author.id === gameDat.games[index].playersId[1]);

    //console.log(index)
    //console.log(player)

    if (index === -1) throw "err";

    let drawed = func.draw(gameDat.games[index].game.stock, src);

    msg.author.send(src.url + src.imgs[drawed].img);
    msg.channel.send("drawed 1 card(s).");
    ++gameDat.games[index].game.hand[player][drawed];

    //console.log(gameDat.games[index].game.hand);

    fs.writeFileSync(gameDatPath, JSON.stringify(gameDat));
  } catch (err) {
    msg.channel.send("err:"+err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

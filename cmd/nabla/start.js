const consts = require("../../func/const.js");
const fs = require("fs");
const func = require("../../func/nabla.js");

const gameDatPath = "./json/nabla/gameDat.json";
//const srcPath = "./json/nabla/src.json";

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(gameDatPath, "utf8"));
    //let src = JSON.parse(fs.readFileSync(srcPath, "utf8"));

    let i = gameDat.games.findIndex(
      game => game.guildId === msg.guild.id && game.channelId === msg.channel.id
    );

    if (i === -1) {
      gameDat.games.push({
        id: gameDat.games.length,
        guildId: msg.guild.id,
        channelId: msg.channel.id,
        playersId: [msg.author.id],
        game: {}
      });
    } else {
      gameDat.games[i].playersId = [msg.author.id];
      gameDat.games[i].game = {};
    }

    console.log(gameDat);
    msg.channel.send("started");

    fs.writeFileSync(gameDatPath, JSON.stringify(gameDat));
  } catch (err) {
    msg.channel.send("err:"+err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

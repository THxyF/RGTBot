const consts = require("../../func/const.js");
const func = require("../../func/nabla.js");
const fs = require("fs");

const gameDatPath = "./json/nabla/gameDat.json";
const srcPath = "./json/nabla/src.json";

exports.cMain = async function cMain(arg, msg) {
  try {
    let gameDat = JSON.parse(fs.readFileSync(gameDatPath, "utf8"));

    let index = gameDat.games.findIndex(
      game => game.guildId === msg.guild.id && game.channelId === msg.channel.id
    );

    let p = arg.shift(),
      f = arg.shift();

    if (
      !gameDat.games[index].game.field[p][f].includes(
        gameDat.games[index].playersId[p]
      )
    ){//throw "It's not calculated by you";
    }
    msg.channel.send(
      `changed \" ${gameDat.games[index].game.field[p][f]}\" in <@!${
        gameDat.games[index].playersId[p]
      }>'s field into ${arg.join(" ")}`
    );
    gameDat.games[index].game.field[p][f] = arg.join(" ");

    fs.writeFileSync(gameDatPath, JSON.stringify(gameDat));
  } catch (err) {
    msg.channel.send("err:" + err);
    console.log(
      "a defined error happened while executing a command:(" + err + ")"
    );
    return -1;
  }
};

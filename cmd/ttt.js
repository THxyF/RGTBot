const consts=require("../func/const.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  if (msg.channel.type === "dm") return 0;
  if (msg.guild.id !== consts.guildId) return 0;
  let path = `/cmd/ttt/${arg.shift()}.js`;
  if (fs.existsSync("." + path)) {
    let Taccess = require(".." + path);

    try {
      if (Taccess.cMain(arg, msg) === 0)
        console.log(`command:${path} ${arg} is successfully completed.`);
    } catch (err) {
      console.log(
        "a defined error happened while executing a command:(" + err + ")"
      );
      return -1;
    }
  } else {
    console.log("couldn't find command file(" + path + ")");
  }
};

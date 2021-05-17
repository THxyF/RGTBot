const fs = require("fs");
const other = require("../func/otherGame.js");

exports.cMain = async function cMain(arg, msg) {
  let text = fs.readFileSync("./text/cmdHelp.txt", "utf8");

  msg.channel.send(`${arg[0]}D${arg[1]}=${other.diceRoll(arg[0], arg[1]).join(",")}`);
  
  return 0;
};

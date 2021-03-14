const consts = require("../func/const.js");
const post = require("../func/post.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  try {
    if (arg.length < 3) throw "invalid arg";

    let targetCh = msg.guild.channels.cache.find(ch => ch.id === arg[0]);
    if (targetCh === undefined) throw "couldn't find the Ch by ID:" + arg[0];
    
    let targetMsg;

    await targetCh.messages.fetch(arg[1]).then(message => {targetMsg = message});
    if (targetMsg === undefined) throw "couldn't find the Msg by ID:" + arg[1];

    post.edit(`./text/${arg[2]}.txt`, targetMsg);
  } catch (err) {
    throw err;
  }
};

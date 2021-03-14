const consts = require("../func/const.js");
const post = require("../func/post.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  try {
    if (arg.length < 2) throw "invalid arg";

    let targetCh = msg.guild.channels.cache.find(ch => ch.id === arg[0]);
    if (targetCh === undefined) throw "couldn't find the Ch by ID:" + arg[0];

    for(let i = 1; i < arg.length; ++ i){
      post.post(`./text/${arg[i]}.txt`, targetCh);
    }
  } catch (err) {
    throw err;
  }
};
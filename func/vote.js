const consts = require("../func/const.js");
const fs = require("fs");

exports.isVote = (msgId, dat) => {
  return dat.votes.some(v => v.message === msgId)
}
const consts = require("../func/const.js");
const fs = require("fs");

exports.cMain = async function cMain(arg, msg) {
  let rulesCh = msg.guild.channels.cache.find(ch => ch.id === consts.rulesChId);

  let enRules1 = fs.readFileSync("./text/rules-en1.txt", "utf8");
  let enRules2 = fs.readFileSync("./text/rules-en2.txt", "utf8");
  let jaRules = fs.readFileSync("./text/rules-ja.txt", "utf8");

  while (enRules1.length >= 1900) {
    rulesCh.send(enRules1.slice(0, 1900));
    enRules1 = enRules1.slice(1900, enRules1.length);
  }
  rulesCh.send(enRules1);

  while (enRules2.length >= 1900) {
    rulesCh.send(enRules2.slice(0, 1900));
    enRules2 = enRules2.slice(1900, enRules2.length);
  }
  rulesCh.send(enRules2);

  while (jaRules.length >= 1900) {
    rulesCh.send(jaRules.slice(0, 1900));
    jaRules = jaRules.slice(1900, jaRules.length);
  }
  rulesCh.send(jaRules);
};

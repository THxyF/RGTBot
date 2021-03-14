const consts = require("../func/const.js");

exports.cMain = async function cMain(arg, msg) {
  let list = [
    "Organizer",
    "DJ"
  ];
  let reactions = msg.guild.emojis.cache.filter(ej => list.includes(ej.name));

  msg.guild.channels.cache
    .find(ch => ch.id === consts.rulesChId)
    .messages.fetch()
    .then(messages => {
      let theMsg = messages.find(m => m.id === "806819304447541248");
      reactions.forEach(re => theMsg.react(re));
    });
};
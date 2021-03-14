exports.cMain = async function cMain(arg, msg) {
const discord = require('discord.js');
const client = new discord.Client();
msg.guild.emojis.cache.forEach( emoji => console.log("<:" + emoji.name + ":" + emoji.id + ">"));
};

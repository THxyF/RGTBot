const fetch = require("node-fetch");
const post = require("../func/post.js");

exports.cMain = async function cMain(arg, msg) {
  const source = encodeURIComponent(arg.shift());
  const target = encodeURIComponent(arg.shift());
  const text = encodeURIComponent(arg.shift() /*.join(" ")*/);

  const content = await fetch(
    `https://script.google.com/macros/s/AKfycbweJFfBqKUs5gGNnkV2xwTZtZPptI6ebEhcCU2_JvOmHwM2TCk/exec?text=${text}&source=${source}&target=${target}`
  ).then(res => res.text());
  if (/1 日にサービス translate を実行した回数が多すぎます/.test(content)) {
    msg.channel.send("Error. You ran the service too many times a day.");
    return 0;
  }
  if (/^<!DOCTYPE html>/.test(content)) {
    msg.channel.send("Error. There is Program Errors.");
    return 0;
  }
  post.post(content, msg.channel, msg.id);
  return 0;
};

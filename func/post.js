const consts = require("../func/const.js");
const jsonLib = require("./jsonlib.js");
const fs = require("fs");

exports.post = async (text, ch, msgId = "", options = {}) => {
  let ids = [],
    index = 0;
  let p = Promise.resolve();
  let dat = await jsonLib.read("./json/msgList.json");

  if (text === "" && options == {}) text = "_an empty message_";
  if (text === undefined || ch === undefined)
    throw new Error(
      `invalid arg to post.post():text = ${text}, ch = ${ch}, options = ${options}`
    );

  while (typeof text === "string" && text.length >= 1900) {
    p = p
      .then(() => ch.send(text.slice(0, 1900)))
      .then(m => {
        ids.push(m.id);
        return m;
      });
    text = text.slice(1900, text.length);
  }
  p = await p
    .then(() => ch.send(text, options))
    .then(m => {
      ids.push(m.id);
      return m;
    })
    .then(m => {
      if (msgId !== "") {
        index = dat.list.findIndex(o => o.parentId === msgId);
        if (index === -1) {
          dat.list.push({ parentId: msgId, childrenId: ids });
          if(dat.list.length > 20)dat.list.shift();
        } else dat.list[index].children.concat(ids);
      }
      return m;
    });

  await jsonLib.write("./json/msgList.json", dat);

  console.log(dat);

  return p;
};

exports.edit = async (text, msg, options = {}) => {
  if (typeof text === "string" && text.length >= 2000)
    throw "too Long Src:" + text.length;
  else return msg.edit(text, options).then(m => console.log(m.content));
};

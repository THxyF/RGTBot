const consts=require("../func/const.js");
const times=require("../func/time.js");
const discord = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");

const client = new discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

exports.cMain = async function cMain(arg, msg) {
  if (msg.channel.type === "dm") return 0;
  if (msg.guild.id !== consts.guildId) return 0;

  try {
    if (arg[0] === "set") {
      if (arg.length > 1) {
        //スケジュール読み込み
        let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));
        let mentionsDat = JSON.parse(fs.readFileSync("." + consts.scheduleTimePath, "utf8"));

        let newSchedule = consts.schedule;

        const japanStandardTime = await new Date().toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo"
        });
        const jnow = await new Date(japanStandardTime);
        let time = {
          hour: jnow.getHours(),
          min: jnow.getMinutes(),
          day: undefined
        };

        newSchedule.name = arg[1];
        newSchedule.organizer.name = msg.author.tag;
        newSchedule.organizer.id = msg.author.id;
        newSchedule.participants = [
          {
            name: msg.author.tag,
            id: msg.author.id
          }
        ];

        if (arg.length > 4) {
          let len = await scheduleDat.schedule.length;
          if (arg[2] < 0 || 6 < arg[2]) throw "invalid week(arg[2])";
          if (arg[3] < 0 || 23 < arg[3]) throw "invalid hour(arg[3])";
          if (arg[4] < 0 || 59 < arg[4]) throw "invalid min(arg[4])";

          time.day = parseInt(arg[2]);
          time.hour = parseInt(arg[3]);
          time.min = parseInt(arg[4]);

          times.genFirstMTime(time)
            .then(async newTime => {
              let index = await mentionsDat.mentions.findIndex(
                mention => mention.id === len.toString()
              );

              if (index !== -1) mentionsDat.mentions.splice(index, 1);
              mentionsDat.mentions.push({
                id: len.toString(),
                time: newTime
              });

              if (!fs.existsSync("." + consts.scheduleTimePath))
                throw "ファイルが見つかりません(scheduleTimePath)。";
              fs.writeFileSync("." + consts.scheduleTimePath, JSON.stringify(mentionsDat));
            })
            .catch(err => {
              throw err;
            });
          newSchedule.schedule = time;

          let out = "JST";

          out += `(${times.dayToString(time.day)})`;

          out += `${time.hours}:`;
          if (0 <= time.min && time.min <= 9) out += "0";
          out += `${time.min}~\n`;
          msg.channel.send("at " + out);
        }

        scheduleDat.schedule.push(newSchedule);
        msg.channel.send("added a new schedule!");

        //スケジュール書き込み
        if (fs.existsSync("." + consts.schedulePath)) {
          fs.writeFileSync("." + consts.schedulePath, JSON.stringify(scheduleDat));
        }
      } else {
        throw "無効な引数";
      }
    } else if (arg[0] === "modify") {
      if (arg.length < 3) throw "無効な引数。";

      //スケジュール読み込み
      let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));

      if (scheduleDat.schedule.length <= arg[1]) throw "無効な引数(number)";
      if (scheduleDat.schedule[arg[1]].organizer.id !== msg.author.id)
        throw "主催者のみが変更できます。";

      switch (arg[2]) {
        case "name":
          scheduleDat.schedule[arg[1]].name = arg[3];
          break;
        case "time":
          if (arg.length < 6) throw "invalid arg(arg.length).";
          if (arg[3] < 0 || 6 < arg[3]) throw "invalid week(arg[3])";
          if (arg[4] < 0 || 23 < arg[4]) throw "invalid hour(arg[4])";
          if (arg[5] < 0 || 59 < arg[5]) throw "invalid min(arg[5])";

          scheduleDat.schedule[arg[1]].schedule.day = arg[3];
          scheduleDat.schedule[arg[1]].schedule.hour = arg[4];
          scheduleDat.schedule[arg[1]].schedule.min = arg[5];

          times.genFirstMTime(scheduleDat.schedule[arg[1]].schedule)
            .then(newTime => {
              mentionsDat.mentions = mentionsDat.mentions.filter(
                mention => mention.id != arg[1]
              );

              mentionsDat.mentions.push({ id: arg[1], time: newTime });

              if (!fs.existsSync("." + consts.scheduleTimePath))
                throw "ファイルが見つかりません(scheduleTimePath)。";
              fs.writeFileSync("." + consts.scheduleTimePath, JSON.stringify(mentionsDat));
            })
            .catch(err => {
              throw err;
            });
          let out = "JST";

          out += `(${times.dayToString(arg[3])})`;

          out += `${arg[4]}:`;
          if (0 <= arg[5] && arg[5] <= 9) out += "0";
          out += `${arg[5]}~\n`;
          msg.channel.send("at " + out);
          break;
        default:
          throw "無効な引数(type)";
          break;
      }
      msg.channel.send("rewrote the schedule!");

      //スケジュール書き込み
      if (!fs.existsSync("." + consts.schedulePath)) throw "dir err(scheulePath)";

      fs.writeFileSync("." + consts.schedulePath, JSON.stringify(scheduleDat));
    } else if (arg[0] === "delete") {
      if (arg.length < 1) {
        throw "無効な引数";
      } else {
        let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));
        let mentionsDat = JSON.parse(fs.readFileSync("." + consts.scheduleTimePath, "utf8"));

        if (scheduleDat.schedule.length > arg[1]) {
          if (scheduleDat.schedule[arg[1]].organizer.id === msg.author.id) {
            scheduleDat.schedule.splice(arg[1], 1);

            mentionsDat.mentions = mentionsDat.mentions.filter(
              mention => mention.id != arg[1]
            );

            mentionsDat.mentions.forEach(mention => {
              if (mention.id > arg[1]) {
                mention.id = (mention.id - 1).toString();
              }
            });

            if (!fs.existsSync("." + consts.schedulePath)) throw "dir(schedulePath) err";
            if (!fs.existsSync("." + consts.scheduleTimePath)) {
              throw "dir(scheduleTimePath) err";
            }

            fs.writeFileSync("." + consts.schedulePath, JSON.stringify(scheduleDat));
            msg.channel.send("deleted the schedule!");

            fs.writeFileSync("." + consts.scheduleTimePath, JSON.stringify(mentionsDat));
            console.log("deleted the mentionDat!");
          } else {
            throw "主催者のみが削除できます。";
          }
        } else {
          throw "無効な引数(number)";
        }
      }
    } else if (arg[0] === "join") {
      let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));
      let mentionsDat = JSON.parse(fs.readFileSync("." + consts.scheduleTimePath, "utf8"));

      if (arg.length < 1 || scheduleDat.schedule.length <= arg[1]) {
        throw "無効な引数(number)";
      } else {
        let index = scheduleDat.schedule[arg[1]].participants.findIndex(
          ptp => ptp.id === msg.author.id
        );
        if (index === -1) {
          scheduleDat.schedule[arg[1]].participants.push({
            name: msg.author.tag,
            id: msg.author.id
          });

          let organizer = client.users.cache.find(
            user => user.id === scheduleDat.schedule[arg[1]].organizer.id
          );
          if (organizer != undefined) {
            organizer.send(
              `${scheduleDat.schedule[arg[1]].name}に${msg.author.tag} が参加しました。`
            );
          } else console.log("主催者不明");

          if (fs.existsSync("." + consts.schedulePath)) {
            fs.writeFileSync("." + consts.schedulePath, JSON.stringify(scheduleDat));
            msg.channel.send("joined the schedule!");
          }
        } else throw "参加済みです。";
      }
    } else if (arg[0] === "quit") {
      let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));
      let mentionsDat = JSON.parse(fs.readFileSync("." + consts.scheduleTimePath, "utf8"));

      if (scheduleDat.schedule[arg[1]].organizer.id === msg.author.id) {
        throw "主催者です。";
      }

      if (arg.length < 1 || scheduleDat.schedule.length <= arg[1]) {
        throw "無効な引数(number)";
      } else {
        let index = scheduleDat.schedule[arg[1]].participants.findIndex(
          ptp => ptp.id === msg.author.id
        );
        if (index != -1) {
          scheduleDat.schedule[arg[1]].participants.splice(index, 1);
          let organizer = consts.client.users.cache.find(
            user => user.id === scheduleDat.schedule[arg[1]].organizer.id
          );
          if (organizer != undefined) {
            organizer.send(
              `${scheduleDat.schedule[arg[1]].name}を${msg.author.tag} が離脱しました。`
            );
          } else console.log("主催者不明");

          if (fs.existsSync("." + consts.schedulePath)) {
            fs.writeFileSync("." + consts.schedulePath, JSON.stringify(scheduleDat));
            msg.channel.send("exited from the schedule.");
          }
        } else throw "参加していません。";
      }
    }

    let scheduleDat = JSON.parse(fs.readFileSync("." + consts.schedulePath, "utf8"));
    let mentionsDat = JSON.parse(fs.readFileSync("." + consts.scheduleTimePath, "utf8"));

    let out = "";
    if (scheduleDat.schedule.length === 0) {
      throw "Not Found";
    } else {
      for (let i = 0; i < scheduleDat.schedule.length; ++i) {
        out += `[${i}]name : ${scheduleDat.schedule[i].name}\n`;

        let time = scheduleDat.schedule[i].schedule;
        out += `      time : JST`;

        out += `(${times.dayToString(time.day)})`;

        if (0 <= time.hour && time.hour <= 9) out += "0";
        out += `${time.hour}:`;
        if (0 <= time.min && time.min <= 9) out += "0";
        out += `${time.min}~\n`;
        out += `      organizer : ${scheduleDat.schedule[i].organizer.name}\n`;
        out += `      participants : `;
        for (let j = 0; j < scheduleDat.schedule[i].participants.length; ++j) {
          out += `${scheduleDat.schedule[i].participants[j].name},`;
        }
        out += "\n\n";
      }
      msg.channel.send(out);
      console.log(out);
      out = "";
    }

    console.log(mentionsDat);
  } catch (err) {
    msg.channel.send("Error:" + err);
    console.log(err);
    return -1;
  }
};

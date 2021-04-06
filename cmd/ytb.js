const wurl = "https://www.youtube.com/watch?v=";
const lurl = "https://www.youtube.com/playlist?list=";

const ytdl = require("ytdl-core");
const yLib = require("../func/youtube.js");
const util = require("../func/util.js");
let queue = [];
let connectingVC;
let dispatcher;
let indexes = [0, 0];

let loopFlags = [false, false, false];
let time = 0;

function loop() {
  loopFlag[0] = !loopFlag[0];
}
function loopList() {
  loopFlag[1] = !loopFlag[1];
}
function loopQueue() {
  loopFlag[2] = !loopFlag[2];
}

function nowQueue() {
  console.log("queue:" + wurl + queue.flat()[0]);
  if(queue.flat().length < 1)return undefined;
  if(indexes[0] >= queue.length || indexes[0] <= 0)return undefined;
  if(Array.isArray(queue[indexes[0]]))return queue[indexes[0]][indexes[1]];
  else return queue[indexes[0]];
}
function shiftQueue() {
  if (queue.flat().length < 1) return undefined;

  if (loopFlags[0])return nowQueue();
  else if (loopFlags[1]){
    if(Array.isArray(queue[indexes[0]])){
      if(indexes[1] === queue[indexes[0]].length - 1){
        indexes[1] = 0;
        return nowQueue();
      }
    }
    else return nowQueue();
  }
  else if (loopFlags[2]){
    if(indexes[0] === queue.length - 1){
      if(!Array.isArray(queue[indexes[0]])){
        indexes[0] = 0;
        indexes[1] = 0;
        return nowQueue();
      }
      else if(indexes[1] === queue[indexes[0]].length - 1){
        indexes[0] = 0;
        indexes[1] = 0;
        return nowQueue();
      }
    }
  }
  
  if (!Array.isArray(queue[indexes[0]])) ++ indexes[0];
  else {
    if (indexes[1] < queue[indexes[0]].length - 1) ++ indexes[1];
    else if (indexes[1] === queue[indexes[0]].length - 1) {
      ++ indexes[0];
      indexes[1] = 0;
    }
    else if (queue[indexes[0]].length === 0){
      queue.splice(indexes[0], 1);
      return shiftQueue();
    }
    else {
      ++ indexes[0];
      indexes[1] = 0;
    }
  }

  return nowQueue();
}
function unshiftQueue() {
  if(indexes[0] < 0)return undefined;
  if(indexes[0] >= queue.length){
    -- indexes;
    return undefined;
  }

  if (loopFlags[0])return nowQueue();
  else if (loopFlags[1]){
    if(Array.isArray(queue[indexes[0]])){
      if(indexes[1] === 0){
        indexes[1] = queue[indexes[0]].length - 1;
        return nowQueue();
      }
    }
    else return nowQueue();
  }
  else if (loopFlags[2]){
    if(indexes[0] === 0 && indexes[1] === 0){
      indexes[0] = queue.length - 1;
      if (!Array.isArray(queue[indexes[0]])) {
        indexes[1] = queue[indexes[0]].length - 1;
      }

      return nowQueue();
    }
  }
  
  if (queue.length < 1) return undefined;
  if (Array.isArray(queue[indexes[0]]) && indexes[1] !== 0){
    -- indexes[1];
  }
  else {
    -- indexes[0];
    if(indexes[0] === -1)return undefined;
    if (Array.isArray(queue[indexes[0]]))indexes[1] = queue[indexes[0]].length - 1;
  }

  return nowQueue();
}
function showQueue() {
  console.log(queue);
}

function skip() {
  dispatcher.end();
}
function skipList() {
  ++ indexes[0];
  indexes[1] = 0;
  
  unshiftQueue();
  
  dispatcher.end();
}

function play(connection) {
  dispatcher = connection.play(
    ytdl(nowQueue(), { quality: "highestaudio", begin: time })
  );
  time = 0;

  dispatcher.on("finish", reason => {
    if (shiftQueue() !== undefined) play(connection);
    else {
      voiceChannel.leave();
      connection.disconnect();
    }
  });
}

async function main(arg, msg) {
  let vc = msg.guild.channels.cache.find(
    ch => ch.id === msg.member.voice.channel.id
  );
  if (arg.length < 1) throw new Error("arg!?");

  if (connectingVC !== vc.id) queue = [];

  let url = arg[0];
  let arr = [];

  if (ytdl.validateURL(url)) queue.push(ytdl.getURLVideoID(url));
  else if (ytdl.validateID(url)) queue.push(url);
  else if (yLib.validateListURL(url)) {
    yLib.searchList(lurl + yLib.getURLListID(url)).then(ids => queue.push(ids));
  } else if (url.length === 34) {
    yLib.searchList(lurl + url).then(ids => queue.push(ids));
  } else {
    await yLib.searchVideo(arg).then(async ids => {
      arr = [];
      ids.forEach(
        async id =>
          await ytdl
            .getBasicInfo(wurl + id)
            .then(i => arr.push(i.player_response.videoDetails.title))
      );
      await util.sleep(10000);
      console.log(arr[0]);
      return util.selectArrByRTs(msg, arr).then(s => queue.push(ids[s]));
    });
  }

  console.log("added!" + url);
  console.log("queue:" + queue);

  if (connectingVC !== vc.id) {
    connectingVC = vc.id;
    loop = false;
    await util.sleep(200);
    console.log("connect!");
    vc.join().then(connection => play(connection));
  }
}

function shuffleSaved() {
  let buf = queue.slice(0, indexes[0] + 1);

  queue = util.shuffleArr(queue.slice(indexes[0] + 1, queue.length));
  queue.unshift(buf);
}
function shuffleList() {
  if (!Array.isArray(queue[indexes[0]]))return undefined;
  
  let buf = queue[indexes[0]].slice(0, indexes[1] + 1);

  queue[indexes[0]] = util.shuffleArr(queue[indexes[0]].slice(indexes[1] + 1, queue[indexes[0]].length));
  queue.unshift(buf);
}
function shuffle() {
  let a = queue.flat();
  let index = a.findIndex(id => id === nowQueue());

  if(index === -1){console.log("err");return undefined;}
  
  let buf = a.slice(0, index + 1);

  queue = util.shuffleArr(a.slice(index + 1, a.length));
  queue.unshift(buf);
}

function goto(t) {
  time = t;
  unshiftQueue();
  skip();
}
function volume(t) {
  dispatcher.setVolume(t);
}
function pause() {
  dispatcher.pause();
}
function resume() {
  dispatcher.resume();
}

exports.cMain = (arg, msg) => {
  switch (arg.shift()) {
    case "p":
    case "play":
      main(arg, msg);
      break;
    case "s":
    case "skip":
      skip();
      break;
    case "sl":
    case skipList:
      skipList();
      break;
    case "l":
    case "loop":
      loop();
      break;
    case "sh":
    case "shuffle":
      shuffle();
      break;
    case "shl":
    case "shuffleList":
      shuffleList();
      break;
    case "shs":
    case "shuffleSaved":
      shuffleSaved();
      break;
    case "q":
    case "queue":
      showQueue();
      break;
    case "g":
    case "goto":
      goto(arg[0]);
      break;
    case "v":
    case "volume":
      volume(arg[0]);
      break;
    case "pa":
    case "pause":
      pause();
      break;
    case "r":
    case "resume":
      resume();
      break;
    default:
      msg.channel
        .send(`;ytb [p or play] <_video url/video id/list url/ list id/searching string_>
    : youtube から音楽を流すよ!
;ytb [s or skip]
    : 流している音楽を飛ばすよ!
;ytb [sl or skipList]
    : 流している再生リストを飛ばすよ!
;ytb [l or loop]
    : 流している音楽をループするよ
;ytb [ll or loopList]
    : 流している再生リストをループするよ
;ytb [lq or loopQueue]
    : キュー全体をループするよ
;ytb [sh or shuffle]
    : キュー全体をシャッフルするよ
;ytb [shl or shuffleList]
    : 流している再生リストをシャッフルするよ
;ytb [shs or shuffleSaved]
    : 再生リストを保持してキュー全体をシャッフルするよ
;ytb [q or queue]
    : キューを表示するよ
;ytb [g or goto] <_time_>
    : <time>まで流している音楽を飛ばすよ
;ytb [v or volume] <_amplifier_>
    : 音量を調節するよ(amplifier=1:通常、amplifier=0.5:半分、amplifier=2:二倍)
;ytb [pa or pause]
    : 流している音楽を一時停止するよ
;ytb [r or resume]
    : 一時停止した音楽を再生するよ`);
  }
};

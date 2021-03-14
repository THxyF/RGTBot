exports.dayToString = (number) => {
  let datJp = ["日", "月", "火", "水", "木", "金", "土"];
  let datEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return datEn[number];
}

exports.isSameTime = (time1, time2) => {
  let date1 = new Date(time1);
  let date2 = new Date(time2);

  console.log(time1);
  console.log(time2);

  if (date1.getFullYear() !== date2.getFullYear()) return false;
  if (date1.getMonth() !== date2.getMonth()) return false;
  if (date1.getDate() !== date2.getDate()) return false;
  if (date1.getHours() !== date2.getHours()) return false;
  if (date1.getMinutes() !== date2.getMinutes()) return false;
  return true;
}

exports.isFutureThan = (time1, time2) => {
  let date1 = new Date(time1);
  let date2 = new Date(time2);

  return date1.now() > date2.now();
}

exports.genNextMTime = (mTime) => {
  let nextTime = new Date(mTime);

  console.log(nextTime);

  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < 7; ++i)
        await nextTime.setDate(nextTime.getDate() + 1);

      console.log(nextTime);
      resolve(nextTime);
    } catch (err) {
      reject(err);
    }
  });
}

exports.genFirstMTime = (sTime) => {
  const japanStandardTime = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo"
  });
  const jnow = new Date(japanStandardTime);
  let setTime = new Date(jnow);

  console.log(jnow);

  setTime.setHours(sTime.hour);
  setTime.setMinutes(sTime.min, 0, 0);

  console.log(jnow);

  return new Promise(async (resolve, reject) => {
    try {
      let j = (sTime.day - jnow.getDay()) % 7;
      if (j < 0) j += 7;
      for (let i = 0; i < j; ++i) setTime.setDate(setTime.getDate() + 1);

      console.log(setTime);

      if (setTime.getTime() < jnow.getTime()) {
        for (let i = 0; i < 7; ++i)
          await setTime.setDate(setTime.getDate() + 1);
      }
      resolve(setTime);
    } catch (err) {
      reject(err);
    }
  });
}
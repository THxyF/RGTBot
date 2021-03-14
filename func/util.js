exports.arraysEqual = (a, b) => {
  if (a.length > b.length) return 2;
  if (a.length < b.length) return -2;

  for (var i = 0; i < a.length; ++i) {
    if (!b.includes(a[i])) return 0;
  }
  return 1;
}

exports.sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}


const util = require("../func/util.js");

exports.stockReset = (src) => {
  let stock = {dat:[],sum:src.maxNum}, sum = 0;

  src.imgs.forEach((img,i) => {
    sum += img.num;
    stock.dat.push(img.num);
    console.log("card" + i + "(" + img.name + "):" + img.num)
  });

  if(sum !== stock.sum){
    console.log("err:maybe wrong maxNum.");
    stock.sum = sum;
  }

  return stock;
}

exports.init = (src) => {
  let dat = {
    field:[["1","x","x^2"],["1","x","x^2"]],
    hand:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    stock:{}
  };

  dat.stock = this.stockReset(src);

  for(let k = 0; k < 2; ++ k){
    for(let i = 0; i < 7; ++ i){
      let j = this.draw(dat.stock,src);
      ++ dat.hand[k][j];
    }
  }

  return dat;
}

exports.draw = (stock,src) => {
  let sum = 0;
    
  stock.dat.forEach(i => sum += i);
  if(sum === 0)stock = this.stockReset(src);
    
  let num = util.randInt(sum - 1);
    
  //console.log("num:"+num);
  
  let i = stock.dat.findIndex(c => {
      //console.log("num:"+num+"vs c:"+c);
      if(c > num)return true;
      else {
          num -= c;
          return false;
      }
  })

  -- stock.dat[i];
  -- stock.sum;
  
  console.log("card"+i+"(" + stock.dat[i]+"/"+stock.sum+")");
  
  return i;
}

exports.roll = (x = 6, y = 1) => util.roop(util.randInt, y, x, 1);
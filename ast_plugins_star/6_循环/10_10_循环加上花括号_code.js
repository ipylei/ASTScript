for (var i=0; i<10086; i++)
  console.log(6666666);
console.log(7777777);

while (true)
  console.log(8888888);

  
/* 
还原后:
for (var i = 0; i < 10086; i++) {
 console.log(6666666);
}

console.log(7777777);

while (true) {
 console.log(8888888);
} */
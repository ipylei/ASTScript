function add(a, b) {
  console.log("hello world -> add");
  return a + b;
}


// var Xor = function (p,q)       // 未生效×
function Xor(p, q)         
{
  console.log("hello world -> Xor");
  return p ^ q;
}

var Xor2 = function (p,q){
  console.log("hello world -> Xor2");
  return p ^ q;
}

function And (p, q, r) {
  console.log("hello world -> And");
  return p & q & r;
}

let ret1 = add(1, 2) + add(111, 222);
console.log("------------------");

let ret2 = Xor(111, 222);            
console.log("------------------");

let ret3 = Xor2(111, 222);
console.log("------------------");

let ret4 = And(111, 222, 333);
console.log("------------------");


let ret5 = parseInt("123456", 16);  

/* =====>
function add(a, b) {
return a + b;
}
s = 3 + 333; 
*/
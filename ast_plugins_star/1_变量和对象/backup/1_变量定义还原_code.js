// var a = 123;
// var b = -5;
// var c = String;
// var d = String.fromCharCode;

// function e() {
//     var f = c(123), g = d(0x31);
//     return a + b + f;
// }

while (true) {
    var h = 123;
    var i = 111;  //这里第一次改变
    j = h + 456;
    i = i + 222;  //这里第二次改变
}


function func(m) {
    var m = 100;
    var n = m;
}



/* ====>
function e() {
var f = String(123),
g = String.fromCharCode(0x31);
return 123 + -5 + f;
}
while (true) {
    var i = 111;
    j = 123 + 456;
    i = i + 222;
}


*/
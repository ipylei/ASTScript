/*全局函数 
var a_9;
var m;
m = 10;
ret = m * 2;

var a;
a = String.fromCharCode;
b = a(1000);

var c = String;
var d = c(666);
ret = d;

var d = ["123"];
console.log(d[0]);


zx = ($ = 9) * (f = 10)
zy = f * 20;
var f, $;
*/



//i确实没变，但是循环里t变了!
/* function func(t) {
    var i = t[0], c = Qu(55, []), l = s;
    for (; $u(10, [l, i[L(nt, rt, h)]]); l = $u(4, [l, a])) {
        !function () {
            var e = i[l];
            var t = $u(4, [Y(Ze, it, a), e]); //这里t重复赋值了
            Qi[t] = function () {
                var n = Qi[H(ot, 1816, I)](c(e));
                return Qi[t] = function () {
                    return n;
                }, n;
            };
        }();
    }
} */



//循环中修改变量值
/* 
// var a = 10;
// var a = 5;
    for (var n = -1, t = null == r ? 0 : r.length, o = 0, _ = []; ++n < t;) {
    var a = r[n];
    e(a) && (_[o++] = a);
}
 */


// 循环里重复定义
// var i = 2;
/* var i;
for (; ;) {
    var i = 0;
    m[2] = i;
}
list[5] = i; 
*/



/*变量赋值 
function add(a,b)
{
	a = 5;
	return a + b;
}
var c,d,e,f;
c = 666;
d = c + 110;
e = parseInt;
f = String.fromCharCode;
g = e("10001",2);
h = f(66); 
*/


// 变量定义
var a = 123;
var b = -5;
var c = String;
var d = String.fromCharCode;

function e()
{
  var f = c(123),g = d(0x31);
	return a + b + f ;
}

while(true)
{
  var h = 123;
  var i = 111;
  j = h + 456;
  i = i + 222;
}
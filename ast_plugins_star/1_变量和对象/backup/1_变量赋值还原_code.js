function add(a, b) {
    a = 5;
    return a + b;
}

var c, d, e, f;

c = 666;
d = c + 110;
e = parseInt;
f = String.fromCharCode;
g = e("10001", 2);
h = f(66);


/* ====> 
function add(a, b) {
    return 5 + b;
}
var c, d, e, f;
d = 666 + 110;
g = parseInt("10001", 2);
h = String.fromCharCode(66);
 */
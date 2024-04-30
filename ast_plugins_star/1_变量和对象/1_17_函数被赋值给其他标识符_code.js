function func1(p) {
    return p + 3;
}

var d = func1(1);
var e = func1(2);
var f = func1(3);

var func2 = func1;
var d2 = func2(4);
var c2 = func2(5);
var e2 = func2(6);

var func3;
func3 = func1;
var d3 = func3(7);
var c3 = func3(8);
var e3 = func3(9);
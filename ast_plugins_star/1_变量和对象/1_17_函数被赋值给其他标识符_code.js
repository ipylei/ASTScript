{
    function func1(p=10) {
        return p + 10;
    }

    var d = func1(1);
    var e = func1(2);
    var f = func1(3);

    var func2 = func1;
    var d2 = func2(4);
    var c2 = func2(5);
    var e2 = func2(6);
    var f2 = func2();

    var func3;
    func3 = func1;
    var d3 = func3(7);
    var c3 = func3(8);
    var e3 = func3(9);
}



{
    function func1(p=100) {
        return p + 100;
    }

    var d = func1(1);
    var e = func1(2);
    var f = func1(3);

    var func4 = func1;
    var d2 = func4(4);
    var c2 = func4(5);
    var e2 = func4(6);
    var f2 = func2();          //用到了其他作用域的func2

    var func5;
    func5 = func1;
    var d3 = func5(7);
    var c3 = func5(8);
    var e3 = func5(9);
}
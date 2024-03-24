var nm = function (xH, FH) {
    console.log("hello world >> nm");
    return xH > FH;
};

function mn(xH, FH) {
    // console.log("hello world >> mn");
    return xH < FH;
};

function And (p, q, r) {
    return p & q & r;
}

var bb = nm(a, b);
var cc = mn(33, 44);
let retval2 = And(111, 222, 333);


// ===============================================
/* ===>

    var nm = function (xH, FH) {
        return xH > FH;
    };
    function mn(xH, FH) {
        return xH < FH;
    };
    var bb = a > b;
    var cc = a < b; 
*/
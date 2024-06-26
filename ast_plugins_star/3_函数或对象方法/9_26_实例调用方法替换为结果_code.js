var a = parseInt("12345", 16), b = Number("123"), c = String(true), d = unescape("hello%2CAST%21");

var  a = "motnahp"["split"]('')["reverse"]()["join"]('');
var n = ""["concat"]("ASTPX"["replace"]("PX", ""), " is Good!");
var a = "motnahp"["split"]('')["reverse"]()["join"]('');
var b = "motnahp".split('')["reverse"]()["join"]('');  
var c = ["asd", "sss"].concat("aaa");                   
var d = m.concat("aaa");                         //不应该被还原


let a1 = Math["round"](1);
let b1 = Math["round"](1);


//下面的不能还原
// function And (p, q, r) {
//     return p & q & r;
// }
// let retval2 = And(111, 222, 333);
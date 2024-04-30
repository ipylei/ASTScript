// const string = ["\x68\x65\x6c\x6c\x6f", "\x77\x6f\x72\x6c\x64", "python"];
var $a=['\x77\x36\x77\x35\x42\x51\x3d\x3d','\x77\x70\x54\x44\x76\x6b\x51\x3d'];
var b = "\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97";
var c = '\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97';
var d = '\x5c(\x20*\x5c';
var e = ['\x5c(\x20*\x5c', 'MHKXZ'];
console.log(string);




function decrypt(_0x3bd49b) {
    var _0x1cbfd4 = CryptoJS["\u0065\u006e\u0063"]['Utf8']["\u0070\u0061\u0072\u0073\u0065"](keyStr);
    var _0x498b8d = CryptoJS['AES']['decrypt'](_0x3bd49b, _0x1cbfd4, {
        "\u006d\u006f\u0064\u0065": CryptoJS["\u006d\u006f\u0064\u0065"]["\u0045\u0043\u0042"],
        'padding': CryptoJS["\u0070\u0061\u0064"]['Pkcs7']
    });
    return CryptoJS['enc']['Utf8']['stringify'](_0x498b8d)["\u0074\u006f\u0053\u0074\u0072\u0069\u006e\u0067"]();
}
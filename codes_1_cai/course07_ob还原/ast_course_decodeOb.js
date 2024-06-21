const file = require('fs');
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const template = require("@babel/template").default;
const generator = require("@babel/generator").default;

//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = "./encode.js";
process.argv.length > 3 ? decodeFile = process.argv[3] : decodeFile = "./decodeResult.js";


let sourceCode = file.readFileSync(encodeFile, { encoding: "utf-8" });
let ast = parser.parse(sourceCode);

console.time("处理完毕，耗时");



const transform_literal = {
  NumericLiteral({node}) {
    if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
      node.extra = undefined;
    }
  },
  StringLiteral({node}) 
  {
    if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
      node.extra = undefined;
    }
  },
}


traverse(ast,transform_literal);


const constantFold = {
    "BinaryExpression|UnaryExpression"(path) {
        if (['-', 'void', '/'].includes(path.node.operator)) {
            return;
        }
        const {confident, value} = path.evaluate();
        if (!confident)
            return;
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        path.replaceWith(types.valueToNode(value));
    },
}

traverse(ast, constantFold);


function _0x512c97(W,o,d,c,k){return _0x433a(k-453,W)}function _0x3a32(){var W=["W6VcK8onW4/cLW","dSo1WPWIna","amo7WRLNWRO","as3cPW1J","WRPvrGix","E8odCtjImCkQW4a","ewtcHSoKEq","W5FdT8onWRddGa","uZzzjve","e0iXW6xdNG","W6HEWRLuia","pCo6WP9eWQK","isxcLay","xx8OW75q","B8owW7FdTSob","E8kaACkctq","pM3dSgj8","cmk2W7FdKhm","WPfxW7ZdK8kD","W6SYC8ogW6y","qYH6g3m","yCkcW69+Fvr8W5xcJKRcUr8","Eb9cW45x","gZZdTSo+fW","ASo0W5BdJSoY","cmkvdmkumW","b8o9WPXxWQ0","W6bNhZrz","ymkBt8kAra","hsFcQWbL","vY13mcW","W63dQSoGWO/dJW","ke8xWOHTfcRcUH3dMa","C8kqW65jeCkXhNpdJxRcHmoXvW","W6ZcLX4S","mSowWP8OBq","Fmkkr8k8uW","kreuW43cJW","h8kms8oT","W4NdGCkRD8oQ","W4TIcYXq","n3lcU8o7sa","efqeW7hdUG","bSo5W7aBqG","smo2W4K","W7pdH1jcW54","W4Okr3pcVq","nbxdMSo1W71lW78Vf8klrqpdIq","WPLjW6xdIW","W4hdGeHMW44","WPfgaL1T","W6ePAmoo","hmobWOhdGSoi","WPlcQb7cRmk3","zZbfW7br","WOrrFdes","W5dcQSohn2u","gSoqWPynhG","yGjmW49n","W7FcJ8o1pKC","WPnuW5xdNmk0","W6TImZTO","qcncW5DQ","jcVcM8opEq","WPHLqZWH","bJ7cUmoPva","W5eAv2JcTW","fdJcRCoYwa","patdGSoIfa","W63dR8kqcmoh","W4BdTgP5W5S","W43dRmoNWQ/dNG","W7z9tMhdIW","k8ovWOaSEq","i0eFWOWvAchcQbtdQhjo","iCkbAGzC","sM/cP8kLWQe","FSkhzCkHCW","dc/cQmkgFa","zfBcNCkVWRq","W67dKSkIvSoL","WP5ptx/dIa","WRX8iMfu","WQVdHf1VfSorWOlcM3lcNrBcUa","WOn6aLjg","A8onW5FdPSoj","nc3cIaW","W7viANVdRa","cSo7WRexsq","l8oBWPCNoa","b8olW6Wn","E8oPWQZcICog","cs7cUmoYtG","pSooWPRdNmos","WOFcHeDWxvT1mGpcUG","c8oTWQXKWQS","FGDmW71W","oK3dQ0f0","W7pdHmoZWO/dRq","FSk1WOFdUSkY","WQLtW67dVCkO","dcWkW4xcNG","vYbTeu8","lCoDWO06pG","u8oYWPNcV8or","DLBcGCkQWRK","pvJdH8oJW7m","hwBcUCoTfW","dSofWQ49BG","dwBdSCoMW4K","WRPobqiq","zh3dKf0ScSkIrmk2W4CwjG","emozmmkNW6y","hCoBW7qPwa","W7RdHGCSvG","W55XgZ9I","W7VcGXCJxW","hmkntCoVW7q","gSktcCkBgW","W4yiCIje","W43cTCo3W7JcRG","W5BdKHG","qdXRnG","zrTElh0","Fmo/WQNcOSo7","kxZcLSoUAW","lCoRjSkAW58","eCo0WOBdHmoo","xg5mWPhdLJfnjCoZbmo+WPK","W4pcUXW0xG","qsvIzNe","WPtcTrBcVSk2","W4rRruFdTa","xhK2W4zc","W4RdTuldOSkd","d8o4W6ddHYG","pmoDomk2W60","rZjVChu","bdhcVZ93","cCoHWOyRiG","chvAW5lcMG","nCoqWRvOWOy","nZpcP8oQta","fxK7id0PW5HwW7HJuCoT","W5ipACoKW60","vCo9W53dTq","Amo0W7RdT8od","FCkWWO7cQ8oL","W7/dHGieWOq","u3GrW7DO","cxBcOCogyG","tSosW6NdLmoF","WQfoqG","W4/dRCkwW7dcVW","W6PjWQjpzW","xI9xW5jR","b8oPWOKizq","j8kQDCouW5m","W6j2ecHI","f8oiW7Kqsq","wCoPW57dRmo1","caFcMmoIFG","CqDFW5DB","WQLqvrOb","W4VdH8kNv8oD","WQhcRJdcVmkH","kmkWmSkria","AcrEuNW","W4vRWP9udG","omorWQLQWPG","CGfNW55M","cCkQW5ZdKW","jCoqWP0","ESoVWP7cJSo5","dL7dPvDK","BflcI8kVWRu","WRXfvWaz","gcW2W7RcVq","WRJcKCoLd8kKqd1vqJFcGmoV","afKvW47dNW","jSo9W7BdRa","E8oVWP7cSSoL","BLCRW4Tw","Av0RW6Dr","EYZdS2lcQW","WODuvdCv","W7JdPmkfq8oL","ixRcJSoVAG","BWhdHM3cOW","e0pdS8oFW4u","W68DqrbQ","l0VdQ0bF","hmoBW7qoDW","W43dL8kDBSok","W6btWR1ioW","aCozW7FdVqS","W6FcPCowW4hcMW","peK3W7JdNG","dCoxWQG+ta","puBdL8oGW7i","k38vW5K","W7noWOnzdG","W6RcVGuWBa","W4pdTmkqDSoP","grZcTdLW","W7nyWPrVkq","wCkguCkBCG","vCkAW4GJzmkTdae","W4qZqXzQ","ACkYWO7dMSkR","ke3cL8o8EG","W6ldKfnz","W4ZdIb43DW","Fs5KW79N","ESoqWP/cN8oM","nbtdM8o7W7XdWPa9fmkQsJm","W6jTmJTR","bIb3WR0vDmkQbmkWW5BdQqu","ngC/W5ddKq","W4n2lqTY","i8otWQKtwa","W4xcTmkDpwu","WPldVSo6W5RdQa","lCoxWQ06","dmk0iSkrbq","W6dcMmoKe10","se7cNmkWWPW","WO3cIK8bqKP4ccW","WQvPa3iZW44AWPC7W7zhfa","cmobW6VdQrS","W6ZdJCk8sCoO","iSktW7pdP0q","mSk0b8kYha","dYOYW4ZcOW","C8obW7FdT8om","W7JdSmkZemom","WR9hlLzL","CSo3W4tcPmo4","WQfps1zs","W7/cKZu2sq","lSogWRCyvq","hmoiWQyHca","WQ3dPCkExX8","rJXSn3y","hmklW4VdK0y","f14nW5tdMa","WRPSW53dI8kk","W4BcNbivEq","cKOVW7RdTa","W71pWQXEkG","W4JdVCoaWRddUa","W5xdVmonWQJdJq","t8kEWPJcNG","W5NdM8kdimoh","W7S/uG","W4JcUmkhj34","W6SMyW","F8ohaezshmk3W77dQmkr","vcnfFhe","W6yYvmoXW6S","kCkCvWnH","tmkCtCk+ta","W5ddG2LBW4u","BxOcW4Li","W6hdKSkYkSoF","W7/cQmoVi1i","cCkmcSkBgq","WQpdSCo1W4BdNW","fvBdVgf4","BxpcNCkZWQa","mmoCWRK","peJcHSoFqq","pKNdTfHj","FxqaW4JdHq","W4uixsvI","tSkgBmkCDa","ih3dJ8oIW5y","W77dRSk5n8oo","A8kcW6CKkt9EW43cQG","W4JcTSkDW7K","W43cH8oWnMq","lCoqW64dDa","bSk2EGLf","EbuOsf4","t8oRW5RdS8om","W6BcOSoKW4W","WPrrW73dLSkS","d8olW5OnCG","zKxcLCkwWPS","y8kvWPFdR8ko","W6bAmtX1","WOVcRY7cRSkr","lSo9W63dIHm","wJT4EMe","tw/cOSkOWPW","bh/cTSoAzq","ar3cLGTM","eZlcN8o0sq","m8osW4/dSrO","WP5uW7JdJCkr","kSogW5ZdMtu","WOFcJJdcSCkv","EwKKW4LT","b8kMuCoxW7i","umkmFSk/CG","W5RdN25fW4C","c8oQWRySjq","fmk0nCkheq","wmo6WQ7cKSo7","tY4FW53cKG","qbbDW7Pb","kgpdImoSW6i","mwqYW7RdGW","kmomW7CJxa","j8oJWQBdRSoo","nCkommkJkW","WPxdOSoCW7JdNG","BeJcIG","WOHtW43dSmkE","qmoOW57dRCoa","W6uVyCoq","WOLvW67dNCkj","omoyW6/cP8oX","W5D2rgi","omotWReggW","uMNdTCk2Fd7dNmoykmoZ","amkNnmkLca","zsnBW5Pg","WORdPCoOW6FdUa","W6eNCComW6S","W5JdPfbMW68","W7dcSSoLW43cRG","BmkJW4RcVmoQ","W7/cUrC","nd/dS8opkW","e8k8CIbV","aXJcUSoXuG","pZhdTmo6ja","W4FcSmkCluG","W59OuMhdNq","W6ZcNt4SuW","fcNdKmoSnW","rSk0WPBdU8kq","nCojWPLCWPi","W6pdSwXQW6a","aCoIWRtdGCoq","vXzkbMO","W7S/z8oGW6C","WPniW6ldJmkl","ou/dTvvH","kCoioSkSW7u","kCoaWRe6iW","twyEW5H9","sWv0DhC","W77dQSkdemor","W6VdNmk5lCo1","W6aDu8oqW7C","WQVcKW7cMCkG","DKtcT8k7WP8","fL3dP15w","adqTW5pcQW","EqqnWPik","fctdHSoTbq","W4JcVCkfo0K","cmoTWRG2za","ASoGWOBcQmou","W4P6th3dQq","fmocWQOmlq","jahdK8oNgG","bSoGWPGAsq","WPJdO8orW6xdOG","dCk4eCkr","hmkRW5VdM3C","aZJcRSo1","C8oFWQ7cRSo5","lv/dTCo9W4G","emopW7mv","W5ZcKSkre2y","CgNcRmkYWOu","W47cIcWUAW","WRZdISoDW6RdGG","f8opW6etCa","FY4rW47dHq","d8k6vIz3","b8odW5NdQXi","qdfZjgO","CCo7WP7cQmoZ","W5lcV8kCjgG","svhcImkYWOS","W7lcKWuSwW","lCooWOPYWPm","ms5mWPW","WQZdTCocW7hdRG","W4FdLeLNW6O","W5FdImoJWRBdKG","h8kSW6hdG2a","usH1zf8","CLufW7r0","W5W0rMxcLG","oxmlW5/dHa","tWZdPv3cNG","emofWPaVdG","WOhcPbFcTmk5","bSodWOZdS8oU","WOpdQmoIW4BdUW","uSk1WQ/dJCkI","W7JdTr4jqq","W4/dUmomWPVdMa","WOfnW4VdMCkk","W5BdI8kvBCoX","W43cLmoOW7BcRq","WQTpsWux","WPpcUaNcKCk2","W6hcPCo8W7FcMW","pSoCW4C4zG","e8kYW4BdMhy","W7FcSSofW5ZcRq","k8k0omkJcG","W7bvWRHnlq","W57dHSkiy8o2","ae3dP8o+W6y","W77cStSSra","WR1pW73dJmk1","WQvhBHOY","W6hcS8oPW4VdQq","tGhdQ0pcIW","W6P4fqbj","bCofdmoLW6q","CH5FW7be","nbhcSrP8","W6ZcS8oVW5lcKW","a2RcPSoFBG","bCoQbmkVW4q","yWDdW5jw","CZBdUN7cHa","cSoKWRSSgG","dSooa8kIW40","W4HFCg/dKa","jxFcRCo8EG","W6WTgYrK","W6ZcMGy+tW","WOnfnfLn","i8obaSkfW44","W4/cLYOSzq","W4JcLH4Uuq","or7cSGPr","zIzMW61h","hSoEWRedba","pNyvW5ddIq","qZP8ExW","W7VcNqmRvq","cmknrCoQW78","ECk+sCkfvW","cg/cOmozza","W4r9E1/dGG","kKBdSCo6W7q","W5/cHaGAtq","b8oyWPrkWOu","m1FcTCo6yG","kMJcK8oVDq","W7hdJ8ogWRZdUG","l8orWPrTWP4","W7JdL3DRW58","CuNcSSkC","W5RdH1fhW4S","WQ7dRCkfemol","cx3dPmoMtG","W7i8zZDb","W7dcKYeTzG","CSkCWQJdV8kS","oSkeBcvf","eCkcWP/dRu0","kSo3W6ZdOqW","CmoEWRZdJCo1","ySklWQ0nva","imkAtdjL","W6BcUmoZfLu","n8o5W4VdGc0","W67dTSkoaa","W4zIW6ddKCkJCmkx","WOddQCo9W6NdHG","W7aCxCoMW5e","WRXrzGel","acJcGGDm","tdPVu1C","aCoPW6ddGmok","WPjLoMC","W7zasMxdJa","jhpdOmonW7a","W7KRyeJcTW","W754EmkwW6m","W6z7zwRdVG","W53cTIO5wa","imoLW7utwG","f8oNoSkYW6m","W6VdUmkffG","w2qPW7HG","luZdP0bF","emoTWQZdM8oH","W63dVSkplmoP","hmkTm8keiW","d8oujCknW4q","W63dIsyuCq","z0mTW6DP","l8oZjmkpW7q","W5OAFKBcIW","WO41g2ZcIq","BtbvW77dOmk6w3uM","WQpdIrjrWP0","W7VcKmkeeNG","tgiLnq","bs/dMmoIfG","W5NcOSkkigu","W5r8dZ1J","kaKlW4tcPq","wqbiW4T3","rSokW63dLSon","WPTrfIngWRVdPW","EmkDWQe","e3eaW43dTG","sxdcV8kQWOW","W6rqCuBdHG","jKJdShX7","pCoMW7RdQG4","W7FdVmk1FYO","n8oXW7NdUGa","D1pcJSk3WQi","W67cTCohW5ZcGW","WPjbW7NdNSkG","jmo5WPWtAW","WRzFW7ZdHSkv","EXNcVCo+W6xdImkaBe4","lSoxWPr6","W7mMrc5d","kvCSW6RdLq","pfpdQfTZ","W5ZdLHmSuq","ehuDW7pdGG","W4XYWQzoca","ebxcTCoKBW"];return(_0x3a32=function(){return W})()}function _0x433a(W,o){var d=_0x3a32();return(_0x433a=function(o,c){var k=d[o-=335];if(void 0===_0x433a.lFFOmB){var m=function(W){for(var o,d,c="",k="",C=c+m,S=0,a=0;d=W.charAt(a++);~d&&(o=S%4?64*o+d:d,S++%4)?c+=C.charCodeAt(a+10)-10!=0?String.fromCharCode(255&o>>(-2*S&6)):S:0)d="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=".indexOf(d);for(var r=0,t=c.length;r<t;r++)k+="%"+("00"+c.charCodeAt(r).toString(16)).slice(-2);return decodeURIComponent(k)};_0x433a.OkOYKY=function(W,o){var d,c,k=[],C=0,S="";for(W=m(W),c=0;c<256;c++)k[c]=c;for(c=0;c<256;c++)C=(C+k[c]+o.charCodeAt(c%o.length))%256,d=k[c],k[c]=k[C],k[C]=d;c=0,C=0;for(var a=0;a<W.length;a++)C=(C+k[c=(c+1)%256])%256,d=k[c],k[c]=k[C],k[C]=d,S+=String.fromCharCode(W.charCodeAt(a)^k[(k[c]+k[C])%256]);return S},W=arguments,_0x433a.lFFOmB=!0}var C=o+d[0],S=W[C];if(S)k=S;else{if(void 0===_0x433a.stlgDh){var a=function(W){this.wSaxxP=W,this.XJsrVY=[1,0,0],this.XhqmKU=function(){return"newState"},this.gxLbOP="\\w+ *\\(\\) *{\\w+ *",this.gyEOmZ="['|\"].+['|\"];? *}"};a.prototype.BeFgDo=function(){var W=new RegExp(this.gxLbOP+this.gyEOmZ).test(this.XhqmKU.toString())?--this.XJsrVY[1]:--this.XJsrVY[0];return this.yGWTVz(W)},a.prototype.yGWTVz=function(W){return Boolean(~W)?this.irLhcC(this.wSaxxP):W},a.prototype.irLhcC=function(W){for(var o=0,d=this.XJsrVY.length;o<d;o++)this.XJsrVY.push(Math.round(Math.random())),d=this.XJsrVY.length;return W(this.XJsrVY[0])},new a(_0x433a).BeFgDo(),_0x433a.stlgDh=!0}k=_0x433a.OkOYKY(k,c),W[C]=k}return k})(W,o)}

(function (_0x4de4ad, _0x195738) {
  var _0x2a9cf5 = _0x4de4ad();
  function _0x3e6ae7(_0x5955f9, _0x342b28, _0x16ed0f, _0x369efb, _0x5e3fc7) {
    return _0x433a(_0x5e3fc7 - -905, _0x369efb);
  }
  function _0x23fd34(_0x450a34, _0x36105a, _0x51a0d7, _0x463c9d, _0x4e3c0b) {
    return _0x433a(_0x450a34 - 719, _0x51a0d7);
  }
  function _0x546f10(_0x1230f2, _0x5c8f61, _0x19a3a7, _0x159dbc, _0x5b925d) {
    return _0x433a(_0x19a3a7 - -179, _0x5b925d);
  }
  function _0x59be6a(_0x2dd5e9, _0x4c4712, _0x20033a, _0x2ccb7d, _0x5dfc0b) {
    return _0x433a(_0x2ccb7d - 700, _0x2dd5e9);
  }
  function _0x4e4011(_0x284f24, _0x199c6e, _0x5d1dc5, _0x147575, _0x1fde13) {
    return _0x433a(_0x1fde13 - -53, _0x147575);
  }
  while (true) {
    try {
      var _0x1d22fc = -parseInt(_0x3e6ae7(-267, 146, 27, 'OHaO', -101)) / 1 + -parseInt(_0x3e6ae7(-45, -134, -120, 'b5cq', -146)) / 2 * (-parseInt(_0x546f10(660, 590, 436, 689, 'AJt[')) / 3) + parseInt(_0x23fd34(1428, 1488, 'Ox7l', 1206, 1614)) / 4 * (-parseInt(_0x546f10(522, 397, 502, 293, 'cobm')) / 5) + -parseInt(_0x546f10(421, 692, 518, 423, 'm9EE')) / 6 + parseInt(_0x59be6a('tYaE', 1237, 1343, 1470, 1315)) / 7 * (parseInt(_0x23fd34(1112, 935, 'cobm', 1328, 1211)) / 8) + parseInt(_0x4e4011(533, 999, 919, '8W&t', 734)) / 9 * (-parseInt(_0x546f10(231, 639, 464, 499, 'xlEu')) / 10) + parseInt(_0x59be6a('YRK#', 1396, 1538, 1367, 1392)) / 11 * (parseInt(_0x3e6ae7(141, 13, -100, 'Xnvp', -51)) / 12);
      if (_0x1d22fc === _0x195738) break;else _0x2a9cf5['push'](_0x2a9cf5['shift']());
    } catch (_0x10393c) {
      _0x2a9cf5['push'](_0x2a9cf5['shift']());
    }
  }
})(_0x3a32, 595284);

function isNodeLiteral(node) {
    if(Array.isArray(node))
	{
		return node.every(ele=>isNodeLiteral(ele));
	}
    if (types.isLiteral(node)) {
        return true;
    }
    if (types.isUnaryExpression(node, {
        "operator": "-"
    }) || types.isUnaryExpression(node, {
        "operator": "+"
    })) {
        return isNodeLiteral(node.argument);
    }

    if (types.isObjectExpression(node)) {
        let {properties} = node;
        if (properties.length == 0) {
            return true;
        }

        return properties.every(property=>isNodeLiteral(property));

    }
    if (types.isArrayExpression(node)) {
        let {elements} = node;
        if (elements.length == 0) {
            return true;
        }
        return elements.every(element=>isNodeLiteral(element));
    }

    return false;
}



let  decodeCode = "";
let  funcs = [];

const collectObFuncs = 
{
	FunctionDeclaration(path)
	{
		let {id,params,body} = path.node;
		
		if (params.length != 5 || body.body.length != 1)
		{
			return;
		}
		
		if (!types.isReturnStatement(body.body[0]))
		{
			return;
		}
		
		decodeCode += path.toString() + "\n";
		
		funcs.push(id.name);
		
		path.remove();
	
	}
}

traverse(ast, collectObFuncs);

eval(decodeCode);



const  callToString = 
{
	CallExpression(path)
	{
		let {callee,arguments} = path.node;
		if (!types.isIdentifier(callee) || !funcs.includes(callee.name))
		{
			return;
		}
		
		if (!isNodeLiteral(arguments))
		{
			return;
		}
		
		// 使用eval执行函数，得到返回值
		let value = eval(path.toString());
		
		console.log(path.toString(),"-->",value);
		
		path.replaceWith(types.valueToNode(value));
		
	}
}

traverse(ast, callToString);



traverse(ast, constantFold);




function savePropertiesToObject(properties,newMap)
{
	for (const property of properties)
	{
		if (!property.key)
		{
			break;
		}
		let propKey   = property.key.value;
		let propValue = property.value;
		if (types.isStringLiteral(propValue))
		{
			newMap.set(propKey,propValue.value);
		}
		else if (types.isFunctionExpression(propValue))
		{
			let retState = propValue.body.body;
			if (retState.length == 1 && types.isReturnStatement(retState[0]))
			{
				let argument = retState[0].argument;
				if (types.isCallExpression(argument))
				{
					newMap.set(propKey,"Call");
				}
				else if (types.isBinaryExpression(argument) || 
							   types.isLogicalExpression(argument))
				{
					newMap.set(propKey,argument.operator);
				}
			}
		}
		else
		{
			break;
		}
	}
}

function replaceReferNode(newMap,referencePaths,scope)
{
	for (const referPath of referencePaths)
	{
		let {node,parent,parentPath} = referPath;
		let ancestorPath = parentPath.parentPath;
		if (!parentPath.isMemberExpression({object:node})) 
		{
			continue;
		}
		let {property} = parent;
		let propKey = property.value;
		let propValue = newMap.get(propKey);
		if (!propValue) 
		{
			continue;
		}

		
		if (ancestorPath.isCallExpression({callee:parent}))
		{
			let {arguments} = ancestorPath.node;
			switch (propValue) {
					case "Call":
						 ancestorPath.replaceWith(types.CallExpression(arguments[0], arguments.slice(1)));
						 break;
					case "||":
					case "&&":
						 ancestorPath.replaceWith(types.LogicalExpression(propValue, arguments[0], arguments[1]));
						 break;
					default:
						 ancestorPath.replaceWith(types.BinaryExpression(propValue, arguments[0], arguments[1]));
						 break; 
			}
		}
		else
		{
			parentPath.replaceWith(types.valueToNode(propValue));
		}
		
		scope.crawl();
	}	
}


const decodeObject = {
	VariableDeclarator({node,scope})
	{
		const {id,init} = node;
		if (!types.isObjectExpression(init)) return;
		let name = id.name;

		let binding =  scope.getBinding(name);
		let {constant,referencePaths} = binding;
		if (!constant) return;

		let properties = init.properties;
		if (properties.length == 0) return;
		
		let newMap = new Map();
		savePropertiesToObject(properties,newMap); 
		if (newMap.size != properties.length) return;
		
		try
		{
			replaceReferNode(newMap,referencePaths,scope);
		}catch(e)
		{
			console.log(e);
		}
		

		newMap.clear();
	},
}

traverse(ast, decodeObject);

traverse(ast, constantFold);

//去控制流
const decodeControlFlow = {
	
	WhileStatement(path)
	{
		const {node,scope} = path;
		const {test,body}  = node;
		if (!types.isLiteral(test,{value:true})) return;
		if (body.body.length != 2) return;
		let switchNode = body.body[0],breakNode = body.body[1];
		if (!types.isSwitchStatement(switchNode) || 
		    !types.isBreakStatement(breakNode))
		{
			return;
		}
		let {discriminant,cases} = switchNode;
		if (!types.isMemberExpression(discriminant)) return;
		let {object,property} = discriminant;
		if (!types.isIdentifier(object) || !types.isUpdateExpression(property)) return;
		
		let arrName = object.name;
		let binding =  scope.getBinding(arrName);
		if (!binding || !binding.path || !binding.path.isVariableDeclarator()) return;
		let {id,init} = binding.path.node; 
		if (!types.isCallExpression(init) || !types.isMemberExpression(init.callee)) return;
		object   = init.callee.object;
		property = init.callee.property;
		if (!types.isStringLiteral(object) || !types.isStringLiteral(property,{value:"split"})) 
		{
			return;
		}
		
		let disPatchArray = object.value.split("|");
		let retBody = [];
		disPatchArray.forEach(index =>
		{
			let caseBody = cases[index].consequent;
			if (types.isContinueStatement(caseBody[caseBody.length-1]))
			{
				caseBody.pop();
			}
			retBody = retBody.concat(caseBody);
		})
		
		path.replaceWithMultiple(retBody);
		
		scope.crawl();
	},
}

traverse(ast, decodeControlFlow);


const removeDeadCode = {
	"IfStatement|ConditionalExpression"(path)
	{
		let {consequent,alternate} = path.node;
		let testPath = path.get('test');
		const evaluateTest = testPath.evaluateTruthy();
		if (evaluateTest === true)
		{
			if (types.isBlockStatement(consequent))
			{
				consequent = consequent.body;
			}
			path.replaceWithMultiple(consequent);
		}
		else if (evaluateTest === false)
		{
			if (alternate != null)
			{
				if (types.isBlockStatement(alternate))
			  {
			  	alternate = alternate.body;
			  }
				path.replaceWithMultiple(alternate);
			}
			else
			{
				path.remove();
			}
		}  		
	},
  EmptyStatement(path)
  {
  	path.remove();
  },  
  "VariableDeclarator"(path) {
		let { node, scope, parentPath } = path;
		if(parentPath.parentPath.isProgram())
		{
			return;//全局变量不作处理
		}
		let binding = scope.getBinding(node.id.name);
		
		if (!binding || binding.referenced)
		{
			return;
		}
		
		
		if (binding.constant) {//没有被引用，也没有被改变
			path.remove();
		}
		
		if (binding.constantViolations.length == 1 && binding.constantViolations[0] == path )
		{
			path.remove();
		}
		
	},
}



ast    = parser.parse(generator(ast,opts = {jsescOption:{"minimal":true}}).code);

traverse(ast, removeDeadCode);

ast    = parser.parse(generator(ast,opts = {jsescOption:{"minimal":true}}).code);
 
console.log("remove Dead Code.......\n");

traverse(ast, removeDeadCode);



console.timeEnd("处理完毕，耗时");


let {code} = generator(ast,opts = {jsescOption:{"minimal":true}});

file.writeFile(decodeFile, code, (err) => { });
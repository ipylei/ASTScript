
const fs = require("fs");
const path = require("path");

//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;
//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");

let jsfile = path.join(__dirname, "code2_enc.js");
const code = fs.readFileSync(jsfile, "utf-8");

let ast = parse(code);

traverse(ast, {

    // 字符串还原，比如Unicode编码还原成正常的
    "StringLiteral": function(path){
        let node = path.node;
        if(node.extra && /\\[ux]/gi.test(node.extra.raw)){
            // node.extra.raw = node.extra.rawValue;
            delete path.node.extra;
        }
    }
});


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);

fs.writeFileSync("result.js", ouput);


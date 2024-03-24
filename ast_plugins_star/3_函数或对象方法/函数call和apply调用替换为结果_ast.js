/* 
    插件 
 */


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
console.time("处理完成，耗时");


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "函数call和apply调用替换为结果_code.js");
console.log("encodeFile ===> ", encodeFile);

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);

const pluginFuncNormalCall = {
    CallExpression(path) {
        let { callee, arguments } = path.node;
        if (!types.isMemberExpression(callee)) return;
        if (arguments.length < 1 || !types.isIdentifier(arguments[0], { "name": "undefined" })) return;

        let { object, property } = callee;
        if (!types.isIdentifier(object)) {
            return;
        }

        let mode = property.name || property.value;
        if (mode == "apply") {
            path.replaceWith(types.callExpression(callee.object, arguments[1].elements));
        }
        else if (mode == "call") {
            path.replaceWith(types.callExpression(object, arguments.slice(1)));
        }
    }
}
traverse(ast, pluginFuncNormalCall);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


let outputFile = path.join(__dirname, "output.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : outputFile;
console.log("decodeFile ===> ", decodeFile);
// fs.writeFile(decodeFile, ouput, (err) => { });

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
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "函数call和apply替换为常规调用_code.js");
console.log("encodeFile ===> ", encodeFile);

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);

const pluginFuncNormalCall = {
    CallExpression(path) {
        let { callee, arguments } = path.node;
        if (!types.isMemberExpression(callee)) return;
        if (arguments.length < 1
            || (!types.isIdentifier(arguments[0], { "name": "undefined" }) && !types.isNullLiteral(arguments[0]))
        ) {
            return;
        }

        let { object, property } = callee;
        //必须是 func.apply()格式？ 其实xx.func.apply()格式也可以
        if (!types.isIdentifier(object) && !types.isMemberExpression(object)) {
            return;
        }

        let oldString = path.toString();

        let mode = property.name || property.value;
        if (mode == "apply") {
            let ret = path.replaceWith(types.callExpression(object, arguments[1].elements));
            console.log(oldString, "=====>", ret.toString());
        }
        else if (mode == "call") {
            let ret = path.replaceWith(types.callExpression(object, arguments.slice(1)));
            console.log(oldString, "---->", ret.toString());
        }

    }
}
traverse(ast, pluginFuncNormalCall);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": true,  // 是否保留注释
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

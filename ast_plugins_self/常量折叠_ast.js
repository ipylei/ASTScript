/* 
    常量折叠插件
 */

// import { parse } from "@babel/parser";
// import fs from "fs";

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

let jsfile = path.join(__dirname, "常量折叠_code.js");
const code = fs.readFileSync(jsfile, "utf-8");


console.time("处理完成，耗时");

//简易版
const constantFold = {
    // BinaryExpression(二元表达式)： 1-2 | c+d
    // UnaryExpression(一元表达式)：
    // CallExpression(调用表达式)：Math.random()
    // MemberExpression(成员表达式)：a.length
    "BinaryExpression|UnaryExpression|CallExpression|MemberExpression"(path) {
        // 排除一元表达式中诸如 m = -1和m = void 0这种情况;
        if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
            return;
        }
        const { confident, value } = path.evaluate();
        if (!confident)
            return;
        //排除结果为数值类型，但又不合理的情况
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        path.replaceWith(types.valueToNode(value));
    },
}

//丰富版
const constantFold2 = {
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
                return;
            }
            const { confident, value } = path.evaluate();
            if (!confident)
                return;
            if (typeof value == 'number' && (!Number.isFinite(value))) {
                return;
            }
            if (path.isIdentifier() && typeof value == "object") {
                return;
            }
            console.log(value)
            path.replaceWith(types.valueToNode(value));
        }
    },
}


let ast = parse(code);

// 遍历节点，使用enter方法
traverse(ast, constantFold);
// traverse(ast, constantFold2);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);


console.timeEnd("处理完成，耗时"); 
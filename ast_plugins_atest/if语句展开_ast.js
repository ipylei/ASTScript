/* 
    if语句展开
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

let jsfile = path.join(__dirname, "if语句展开_code.js");

const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);


const pluginIfUnfold = {
    IfStatement(path) {
        let { node } = path;
        let { test } = node;

        if (types.isSequenceExpression(test)) {
            let expressions = test.expressions;
            node.test = expressions.pop();
            path.insertBefore(types.expressionStatement(types.sequenceExpression(expressions)));
        }
    }
}
// 遍历节点，使用enter方法
traverse(ast, pluginIfUnfold);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n")
console.log(ouput);
console.timeEnd("处理完成，耗时");

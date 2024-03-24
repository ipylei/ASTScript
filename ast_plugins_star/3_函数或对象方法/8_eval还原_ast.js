/* 
    插件8：https://wx.zsxq.com/dweb2/index/topic_detail/182884848814842
 */

// import { parse } from "@babel/parser";
// import fs from "fs";

const fs = require("fs");
const path = require("path");

const template = require("@babel/template").default;

//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;
//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "8_eval还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginEvalRestore = {
    CallExpression: {
        exit: function (path) {
            let { callee, arguments } = path.node;
            //eval中只包含一个参数，且参数为字面量
            if (arguments.length !== 1 ||!types.isLiteral(arguments[0])) { 
                    return; 
                }
            if (types.isIdentifier(callee, { name: "eval" })) {
                //把参数取出来并构造一个节点
                const evalNode = template.statements.ast(arguments[0].value);
                path.replaceWithMultiple(evalNode);
            }
        },
    }
}


traverse(ast, pluginEvalRestore);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

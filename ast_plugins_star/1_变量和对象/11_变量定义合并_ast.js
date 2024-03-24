/* 
    插件11：https://wx.zsxq.com/dweb2/index/topic_detail/584421144524484
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
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "11_变量定义合并_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const pluginDeclaratorCombine =
{
    VariableDeclaration(path) {
        let allNextSiblings = path.getAllNextSiblings();
        for (let nextSibling of allNextSiblings) {
            if (!nextSibling.isVariableDeclaration()) {
                break;
            }

            path.node.declarations.push(...nextSibling.node.declarations);
            nextSibling.remove();
        }

    },
}

traverse(ast, pluginDeclaratorCombine);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时");

/* 
    插件3：https://wx.zsxq.com/dweb2/index/topic_detail/584585884884824

    注意，如果是非ASCII的Unicode字符串，需要配合generator 一起还原:
    let { code } = generator(ast, opts = { jsescOption: { "minimal": true } });

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


let jsfile = path.join(__dirname, "3_进制字符串还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

/* 字符串还原 */
const pluginStringSimplify = {
    // 处理 \x77\x36\x77\x35\x42\x51\x3d\x3d
    NumericLiteral(path) {
        let { node } = path;
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            //console.log(path.toString());
            node.extra = undefined;
        }
    },
    StringLiteral(path) {
        let { node } = path;
        if (node.extra) {
            // node.extra = undefined;

            // console.log("====", path.toString());
            // delete path.node.extra;
            // path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;
            
            // 处理 '\u5220\u9664\u7248\u672C\u53F7\uFF0Cjs\u4F1A\u5B9A\u671F\u5F39\u7A97'
            if (/\\u/gi.test(node.extra.raw)) {
                // console.log(path.toString());
                // node.extra = undefined;
                path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;

            }

            // 处理 '\x77\x36\x77\x35\x42\x51\x3d\x3d'
            else if (/\\[ux]/gi.test(node.extra.raw)) {
                // console.log(path.toString());
                node.extra = undefined;
            }

        }
    },
}
traverse(ast, pluginStringSimplify);



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

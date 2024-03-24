/* 
    插件10：https://wx.zsxq.com/dweb2/index/topic_detail/418888552455128

    before：
        插件：if加上括号{}
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


let jsfile = path.join(__dirname, "10_10_循环加上花括号_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const standardLoop =
{
    //循环语句加上{}
    "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
        if (!types.isBlockStatement(node.body)) {
            node.body = types.BlockStatement([node.body]);
        }
    },

    //处理if
    IfStatement(path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        //给if加上{}
        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.BlockStatement([consequent.node]));
        }
        //给else加上{}
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.BlockStatement([alternate.node]));
        }
    },
}

traverse(ast, standardLoop);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

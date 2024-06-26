/* 
    插件：7.自执行函数实参还原与替换：(实参是字面量还原？)
        https://wx.zsxq.com/dweb2/index/topic_detail/418484418415828
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
//节点构造模块
const template = require("@babel/template").default;


console.time("处理完成，耗时");

let VAR_NODE = template(`var A = B;`);

let jsfile = path.join(__dirname, "自执行函数实参还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const restoreParams = {
    CallExpression(path) {
        let { callee, arguments } = path.node;

        if (!types.isFunctionExpression(callee) || arguments.length == 0) {
            return;
        }

        let { body, params } = callee;

        body = body.body;

        if (arguments.length > params.length) return;

        for (let i = arguments.length - 1; i >= 0; i--)   //实参的个数可能小于形参的个数
        {
            //构造节点：var 形参 = 实参;
            let newNode = VAR_NODE({ "A": params[i], "B": arguments[i] });
            body.unshift(newNode);

        }

        path.node.arguments = [];
        path.node.callee.params = path.node.callee.params.slice(arguments.length);
        // console.log(path.toString());

    },
}

traverse(ast, restoreParams);


const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputFile = path.join(__dirname, "output.js");
// let decodeFile = process.argv.length > 3 ? process.argv[3] : outputFile;
// console.log("decodeFile ===> ", decodeFile);
// fs.writeFile(decodeFile, ouput, (err) => { });
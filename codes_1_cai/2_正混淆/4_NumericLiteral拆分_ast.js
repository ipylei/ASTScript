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


let jsfile = path.join(__dirname, "4_NumericLiteral拆分_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const NumericToBinary1 = {
    NumericLiteral(path) {
        console.log("-------");
        let value = path.node.value;
        let left = 0 - Math.floor(Math.random() * 10000000 + 10000000);
        let right = value ^ left;

        let node = types.BinaryExpression("^", types.valueToNode(left), types.valueToNode(right));
        path.replaceWith(node);
        // path.stop();
        path.skip();
    },
}

const NumericToBinary = {
    NumericLiteral(path) {//添加退出条件
        if (path.parentPath.isUnaryExpression({ operator: "-" })) return;
        let value = path.node.value;
        let left = 0 - Math.floor(Math.random() * 10000000 + 10000000);
        let right = value ^ left;

        let node = types.BinaryExpression("^", types.valueToNode(left), types.valueToNode(right));
        path.replaceWith(node);
    },
}

traverse(ast, NumericToBinary1);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

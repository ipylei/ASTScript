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

let jsfile = path.join(__dirname, "code0_enc.js");
const code = fs.readFileSync(jsfile, "utf-8");



let ast = parse(code);
// console.log(ast);
// console.log(ast.program.body);





// 遍历节点，使用enter方法
// traverse(ast, {
//     enter(path) {
//         let node = path.node;
//         if (node.type === "NumericLiteral" && node.value === 3) {
//             node.value = 5;
//         }
//         if (node.type === "StringLiteral" && node.value === "hello") {
//             node.value = "hi";
//         }
//     }
// });

//遍历节点，不使用enter，定义对特定类型的解析方法
traverse(ast, {

    //遍历节点示例
    NumericLiteral(path) {
        console.log("---------------修改节点值1---------------");
        if (path.node.value === 3) {
            path.node.value = 6;
        }
    },

    StringLiteral(path) {
        console.log("--------------修改节点值2---------------");
        if (path.node.value === "hello") {
            path.node.value = "what";
        }
    },

    // 移除节点示例
    CallExpression(path) {
        console.log("--------------移除节点---------------");
        let node = path.node;
        if (node.callee.object.name === "console" && node.callee.property.name === "log") {
            path.remove();
        }
    },

    // 插入节点示例(const b = a+1;)
    VariableDeclaration: {
        exit(path) {
            console.log("--------------插入节点---------------");
            let init = types.binaryExpression("+", types.identifier("a"), types.NumericLiteral(1));
            let declator = types.variableDeclarator(types.identifier("b"), init);
            let declation = types.variableDeclaration("const", [declator]);
            path.insertAfter(declation);
            // path.scope.crawl();
            path.stop(); //不再遍历同类型节点
        }
    },


    // 移除节点示例
    // CallExpression: {
    //     exit(path) {
    //         let node = path.node;
    //         if (node.callee.object.name === "console" && node.callee.property.name === "log") {
    //             path.remove();
    //         }
    //     }
    // },

    // 插入节点示例(const c = a+1;)
    // VariableDeclaration: {
    //     exit(path) {
    //         let init = types.binaryExpression("+", types.identifier("a"), types.NumericLiteral(1));
    //         let declator = types.variableDeclarator(types.identifier("c"), init);
    //         let declation = types.variableDeclaration("const", [declator]);
    //         path.insertAfter(declation);
    //         path.stop();
    //     }
    // }

});




//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("=====================>");
console.log(ouput);


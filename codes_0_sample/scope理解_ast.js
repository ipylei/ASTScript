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
// const { type } = require("os");

const { isNodePure, isNodeLiteral } = require("../ast_plugins_star/0_utils")

let jsfile = path.join(__dirname, "scope理解_code.js");
const code = fs.readFileSync(jsfile, "utf-8");

console.time("处理完成，耗时")
let ast = parse(code);


function logStart() {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
}

function logEnd() {
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
}

// 遍历节点，使用enter方法
traverse(ast, {
    //*
    NumericLiteral: {
        enter(path) {
            // var name = 1000;
            logStart();
            console.log("path.toString() => |||", path.toString());

            let { node, scope } = path;
            // console.log("<<<<<", scope.path.toString());
            // console.log(scope.path.type);                 //Program
            // console.log(scope.path.node === scope.block); //true
            console.log("===>===>===>===>===>===>===>===>===>===>===>===>===>isPure:", scope.isPure(node.init, true));
            console.log("===>===>===>===>===>===>===>===>===>===>===>===>===>isPure:", isNodePure(node.init, scope));
            console.log("===>===>===>===>===>===>===>===>===>===>===>===>===>isPure:", isNodeLiteral(node.init));

            let abinding = scope.getBinding("a");           //有绑定
            // let abinding = scope.getBinding("func2");    //有绑定
            // let abinding = scope.getBinding("func3");    //没有绑定!
            // let abinding = scope.getBinding("funcx");    //有绑定!
            if (!abinding) {
                console.log("没有绑定!");
                return;
            }

            console.log("abinding.path.type =>=>=>", abinding.path.type);
            console.log("abinding.path.toString() =>=>=>", abinding.path.toString());
            console.log("是否保持不变", abinding.constant);                             //false 表示已改变
            console.log("是否有引用", abinding.referenced);                             //true 表示有引用
            if (!abinding.constant) {
                console.log("改变的次数", abinding.constantViolations.length);          //改变的次数
                for (let v of abinding.constantViolations) {
                    console.log("改变的地方", v.type, v.toString());                     //改变的地方
                }
            }
            if (abinding.referenced) {
                console.log("引用的次数", abinding.referencePaths.length);         //引用的次数
                for (let r of abinding.referencePaths) {
                    console.log("===>", r.type, r.toString());
                }

            }

            logEnd();
        },
        exit(path) {

        }
    },
    //*/

    /*
    AssignmentExpression: {
        enter(path) {
            logStart();
            console.log("path.toString() => |||", path.toString());

            let { node, scope } = path;
            console.log("作用域path", scope.path.toString());
            let abinding = scope.getBinding("a");
            if (!abinding) {
                console.log("没有绑定!");
            } else {
                console.log("有绑定");
                console.log("绑定path", abinding.path.toString());
            }
            logEnd();
        }
    }
    //*/
});

console.log(name);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.timeEnd("处理完成，耗时")

// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
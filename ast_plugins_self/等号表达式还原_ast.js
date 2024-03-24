/* 
    插件
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

let jsfile = path.join(__dirname, "等号表达式还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");

const equalPlugin = {
    AssignmentExpression: {
        exit(path) {
            let { parentPath, node } = path;
            let { left, operator, right } = node;
            // init时： var a=b=c;
            // right时：a=b=c=d;  
            
            // 这里还可以排除分号";"，即单个的情况a8=a9;
            if (!parentPath.isVariableDeclarator({ "init": node }) && !parentPath.isAssignmentExpression({ "right": node })) {
                return;
            }

            // 操作符必须是=，左节点须是标识符，右节点可以不用是标识符
            // if (!types.isIdentifier(left) || !types.isIdentifier(right) || operator != "=") {
            if (!types.isIdentifier(left) || operator != "=") {
                return;
            }

            //找祖先节点，即找到带分号的截止。 目的是为了在前面插入新的语句。
            let ancestorPath = path.findParent(function (path) {
                let val = path.isStatement();
                return val;
            });
            if (!ancestorPath) {
                return;
            }
            
            // 在祖先节点前面插入
            // 诸如var b1 = b2 = b3 = b4;的情况
            if (ancestorPath.isVariableDeclaration()) {
                //ancestorPath.node.kind => 添加上对应的var、let、const
                ancestorPath.insertBefore(types.VariableDeclaration(ancestorPath.node.kind, [types.VariableDeclarator(left, right)]));
            }
            // 诸如c1 = c2 = c3 = c4 = function () { };
            else {
                ancestorPath.insertBefore(types.expressionStatement(node));
            }

            // 插入后的处理：c1 = c2 = c3 = c4 = function () { }; ==> 诸如c1 = c2 = c3 = c4;
            path.replaceWith(left);
            console.log(">>>==========================");
            console.log(ancestorPath.toString());
            console.log("<<<==========================\n");
        }
    }
}


let ast = parse(code);

// 遍历节点，使用enter方法
traverse(ast, equalPlugin);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);
console.timeEnd("处理完成，耗时")

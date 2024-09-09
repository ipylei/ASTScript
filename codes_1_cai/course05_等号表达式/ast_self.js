/* 
    常量折叠插件
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

let jsfile = path.join(__dirname, "code.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");

let ast = parse(code);

const reduceAssignmentExpression = {
    "AssignmentExpression": {
        exit(path) {
            //进行排除
            let { parentPath, node } = path;
            if (!parentPath.isMemberExpression({ object: node })) {
                return;
            }
            let { left, right, operator } = node;
            if (!types.isIdentifier(left) || !types.isCallExpression(right) || operator != "=") {
                return;
            }

            //找祖先节点
            let ancestorPath = path.findParent(function (path) {
                let val = path.isReturnStatement();
                return val;
            });
            if (!ancestorPath) {
                return;
            }
            console.log("准备插入 !!!")
            //将node插入到return语句前面去
            ancestorPath.insertBefore(types.expressionStatement(node));
            //将整个节点替换为n
            path.replaceWith(left);

        }
    }
}

const equalPlugin = {
    AssignmentExpression: {
        exit(path) {
            let { parentPath, node } = path;
            let { left, operator, right } = node;
            if (!parentPath.isAssignmentExpression({ "right": node }) && !parentPath.isVariableDeclarator({ "init": node }) && !parentPath.isMemberExpression()) {
                return;
            }
            // if (!types.isIdentifier(left) || !types.isIdentifier(right) || operator != "=") {
            if (!types.isIdentifier(left) || operator != "=") {
                return;
            }
            console.log("=====", path.toString());

            //找祖先节点，即找到带分号的截止
            let ancestorPath = path.findParent(function (path) {
                let val = path.isStatement();
                return val;
            });
            if (!ancestorPath) {
                return;
            }

            if (ancestorPath.isVariableDeclaration()) {
                ancestorPath.insertBefore(types.VariableDeclaration(ancestorPath.node.kind, [types.VariableDeclarator(left, right)]));
            }
            else {
                ancestorPath.insertBefore(types.expressionStatement(node));
            }
            path.replaceWith(left);

            // console.log("==========================");
            // console.log(ancestorPath.toString());
            // console.log("==========================");

            //    console.log("准备插入 !!!")
            //     //将node插入到return语句前面去
            //     let newNode = types.expressionStatement(node); //构造语句
            //     console.log("===>", generate(newNode).code);
            //     ancestorPath.insertBefore(newNode);
            //     path.replaceWith(left);
        }
    }
}

const reduceAssign =
{
    AssignmentExpression:
    {
        exit(path) {
            let { parentPath, node } = path;
            if (!parentPath.isAssignmentExpression({ right: node, operator: "=" })) {
                return;
            }

            let { left, operator, right } = node;
            if (operator != "=") return;


            let expressionPath = path.findParent(p => p.isExpressionStatement());
            if (!expressionPath) return;

            expressionPath.insertBefore(types.ExpressionStatement(node));

            path.replaceWith(right);
        }
    }
}


const equalPlugin2 = {
    AssignmentExpression: {
        exit(path) {
            let { parentPath, node } = path;
            let { left, operator, right } = node;
            // right时：a=b=c=d;  
            // init时： var a=b=c;
            if (!parentPath.isAssignmentExpression({ "right": node }) && !parentPath.isVariableDeclarator({ "init": node }) && !parentPath.isMemberExpression()) {
                return;
            }
            console.log("=====");

            // 左节点须是标识符，操作符也必须是"=""
            // if (!types.isIdentifier(left) || !types.isIdentifier(right) || operator != "=") {
            if (!types.isIdentifier(left) || operator != "=") {
                return;
            }


            //找祖先节点，即找到带分号的截止
            let ancestorPath = path.findParent(function (path) {
                let val = path.isStatement();
                return val;
            });
            if (!ancestorPath) {
                console.log("截止");
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

            // 诸如c1 = c2 = c3 = c4 = function () { }; ==> 诸如c1 = c2 = c3 = c4;
            path.replaceWith(left);

            // console.log(">>>==========================");
            // console.log(ancestorPath.toString());
            // console.log("<<<==========================\n");



            //    console.log("准备插入 !!!")
            //     //将node插入到return语句前面去
            //     let newNode = types.expressionStatement(node); //构造语句
            //     console.log("===>", generate(newNode).code);
            //     ancestorPath.insertBefore(newNode);
            //     path.replaceWith(left);
        }
    }
}


// 遍历节点，使用enter方法
// traverse(ast, reduceAssignmentExpression); //可以
traverse(ast, equalPlugin); // 可以

// traverse(ast, reduceAssign); //不可以，因为是专用插件
// traverse(ast, equalPlugin2); //可以


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

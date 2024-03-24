/* 
    for语句展开
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

let jsfile = path.join(__dirname, "for语句展开_code.js");

const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);

// 使用for插件将init、update提取出去后，可以继续使用逗号标号表达式还原插件；
const pluginForUnfold = {
    // ForStatement(path) {
    ForStatement: {
        exit(path) {
            console.log("enter forPlugin-> ForStatement");

            let { parentPath, node, scope } = path;
            let { init, test, update, body } = node;
            //对于for循环：
            //1.把update语句放到请求体里面去，然后将update部分置为空
            //2.把init中的语句放到for循环之前，然后将init部分置为空
            //3.将逗号表达式改为分号结构

            //1.把update语句放到请求体里面去，然后将update部分置为空
            let initPath = path.get("init");
            let updatePath = path.get("update");
            let bodyPath = path.get("body");
            if (bodyPath.isEmptyStatement()) {
                bodyPath.replaceWith(types.blockStatement([]));
            }
            
            //1.把update语句放到请求体里面去，然后将update部分置为空
            if (update && bodyPath.isBlockStatement()) {
                //如果更新体是语句的情况下，则挨个放进去，省去了再次调用逗号表达式。
                /* 
                let insertByUpdate = [];
                if (update.type == "SequenceExpression") {
                    for (let expres of update.expressions) {
                        insertByUpdate.push(types.expressionStatement(expres));
                    }
                } else {
                    insertByUpdate.push(types.expressionStatement(update));
                } */

                let bodyNode = bodyPath.node;
                // bodyNode.body.splice(bodyNode.body.length, 0, ...insertByUpdate);

                bodyNode.body.push(types.expressionStatement(update));
                // 将update置为空
                node.update = null;
            }

            //2.把init中的语句放到for循环之前，然后将init部分置为空
            if (init) {
                path.insertBefore(init);
                node.init = null;

                /* //var、let
                if (init.type == "VariableDeclaration") {
                    console.log("=====> 5555555");
                    path.insertBefore(init);
                    node.init = null;
                }
                //否则，将所有都丢到前面去
                else if (init.type == "SequenceExpression") {
                    console.log("=====> 666666");
                    // path.insertBefore(types.expressionStatement(init));
                    path.insertBefore(init);
                    node.init = null;
                } */
            }
        }
    }
};



// 遍历节点，使用enter方法
traverse(ast, pluginForUnfold);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n")
console.log(ouput);
console.timeEnd("处理完成，耗时")

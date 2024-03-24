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
const { type } = require("os");

let jsfile = path.join(__dirname, "code.js");
const code = fs.readFileSync(jsfile, "utf-8");

console.time("处理完成，耗时")


let ast = parse(code);
// console.log(ast);
// console.log(ast.program.body);



Plugin1 = {
    /*  VariableDeclarator(path) {

        types.emptyStatement()    //空语句(带分号)，如;
        types.blockStatement      //空语句块，如{}
 
        types.variableDeclaration //一条完整的赋值语句(带分号) 比如var a=1;  或者var a=1,b=2,c=3; 
        types.VariableDeclarator  //一条完整的赋值语句(无分号) 比如a=1 或者 a=1,b=2,c=3
 
        types.expressionStatement //一条完整的语句(带分号) 比如a=1; 或者 a=1,b=2,c=3;
        types.sequenceExpression  //一条完整的语句(不带分号)。比如a=1,b=2,c=3
     },
  */

    // VariableDeclaration(path) {
    // AssignmentExpression: {
    ExpressionStatement: {
        enter(path) {
            path.node;
            console.log("====>", path.toString());
            // console.log("进入时");
            // console.log("是否没有变化: ", path.scope.getBinding("a").constant);
            // console.log("是否引用值: ", path.scope.getBinding("a").referenced);

            let d = path.getStatementParent();
            console.log("||||", d.toString());

            // path.traverse({
            //     Identifier(path){
            //         console.log("------------------------", path.toString());
            //     }
            // })

            path.stop();
            // path.skip();

        },
        exit(path) {
            // console.log("退出时");
            console.log("<====", path.toString());

            // path.stop();
            // path.skip();
        }
    }
}

const EnterExit = {
    "BinaryExpression|Identifier": {
        enter(path) {
            if (path.isBinaryExpression() || (path.isIdentifier() && path.parentPath.isBinaryExpression())) {
                console.log("====>", path.toString());
            }
        },

        exit(path) {
            if (path.isBinaryExpression() || (path.isIdentifier() && path.parentPath.isBinaryExpression())) {
                console.log("<====", path.toString());
            }
        }
    }
}

// 遍历节点，使用enter方法
traverse(ast, {
    VariableDeclarator: {
        enter(path) {
            console.log("====>", path.toString());
            // console.log("是否没有变化: ", path.scope.getBinding("a").constantViolations[0].toString());

        },
        exit(path) {

        }
    }
});


traverse(ast,{
    enter(path){
        path.scope.isPure
    }
})

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
// console.log(ouput);
// console.log("\n===|>\r\n", path.toString(), "\r\n<|===\n");

console.timeEnd("处理完成，耗时")

// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

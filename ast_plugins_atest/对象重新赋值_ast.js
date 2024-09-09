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

let jsfile = path.join(__dirname, "对象重新赋值_code.js");
const code = fs.readFileSync(jsfile, "utf-8");

console.time("处理完成，耗时")
let ast = parse(code);


function logStart() {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
}

function logEnd() {
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
}

// 对象赋给变量
function deassign_object(leftNode, rightNode, nextSibling) {
    let leftName = leftNode.name;
    //a = _0x5f4ce4;
    if (nextSibling.isExpressionStatement()) {
        let { expression } = nextSibling.node;
        if (types.isAssignmentExpression(expression) && types.isIdentifier(expression.right, { "name": leftName })) {
            nextSibling.node.expression.right = rightNode;
        }
    }
    // var b=_0x5f4ce4;
    else if (nextSibling.isVariableDeclaration()) {
        let { declarations } = nextSibling.node;
        if (declarations.length == 1) {
            let first_declaration = declarations[0];
            if (types.isVariableDeclarator(first_declaration) && types.isIdentifier(first_declaration.init, { "name": leftName })) {
                first_declaration.init = rightNode;
            }
        }
    }
}

const renameObj = {
    /* 
     _0x5f4ce4 = {"arkXl": _0x5a09c0["KKLDa"]};
    a = _0x5f4ce4;
    */
    AssignmentExpression(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || !types.isObjectExpression(right) || operator != "=") {
            return;
        }
        let nextSibling = parentPath.getNextSibling();
        deassign_object(left, right, nextSibling);



    },

    /* 
    var _0x5f4ce4 = {"arkXl": _0x5a09c0["KKLDa"]};
    var b=_0x5f4ce4;
    */
    VariableDeclarator(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isVariableDeclaration()) {
            return;
        }
        let { id, init } = node;
        if (!types.isIdentifier(id) || !types.isObjectExpression(init)) {
            return;
        }
        let nextSibling = parentPath.getNextSibling();
        deassign_object(id, init, nextSibling);
    }
}
traverse(ast, renameObj);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log(ouput);
console.timeEnd("处理完成，耗时")

// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);
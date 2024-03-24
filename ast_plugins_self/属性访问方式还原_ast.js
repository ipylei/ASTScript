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

let jsfile = path.join(__dirname, "属性访问方式还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");

// b.length; --> b["length"]
const keyToLiteral = {
    MemberExpression: {
        exit({ node }) {
            const prop = node.property;
            //computed为false，且属性为标识符
            if (!node.computed && types.isIdentifier(prop)) {
                node.property = types.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },
    
    //给属性加上引号
    ObjectProperty: {
        exit({ node }) {
            const key = node.key;
            if (!node.computed && types.isIdentifier(key)) {
                node.key = types.StringLiteral(key.name);
                return;
            }
            if (node.computed && types.isStringLiteral(key)) {
                node.computed = false;
            }
        }
    },
}


// b["length"] -->  b.length
const keyToIdentifier = {
    MemberExpression:
    {
        exit({ node }) {
            const prop = node.property;
             //computed为true，且属性为字面量
            if (node.computed && types.isStringLiteral(prop)) {
                node.property = types.Identifier(prop.value);
                node.computed = false;
            }
        }
    },
}

let ast = parse(code);
// traverse(ast, keyToLiteral);
traverse(ast, keyToIdentifier);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

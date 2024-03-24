/* 
    插件16：https://wx.zsxq.com/dweb2/index/topic_detail/181152241541842
    作用：与插件15_15_三目运算符优化一致
 */


const fs = require("fs");
const path = require("path");

const template = require("@babel/template").default;
//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;
//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "15_16_三目运算优化_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const TransConditionExpression =
{
    AssignmentExpression(path) {
        let { left, operator, right } = path.node;

        if (!types.isConditionalExpression(right)) {
            return;
        }
        let { test, consequent, alternate } = right;
        consequent = types.AssignmentExpression(operator, left, consequent);
        alternate = types.AssignmentExpression(operator, left, alternate);
        path.replaceWith(types.ConditionalExpression(test, consequent, alternate));
    },

    ReturnStatement(path) {
        let { argument } = path.node;
        if (!types.isConditionalExpression(argument)) {
            return;
        }
        let { test, consequent, alternate } = argument;
        let retNODE = template(`if(A){return B;}else{return C;}`);
        let retNode = retNODE({ "A": test, "B": consequent, "C": alternate, })
        path.replaceWith(retNode);
    },

}
traverse(ast, TransConditionExpression);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

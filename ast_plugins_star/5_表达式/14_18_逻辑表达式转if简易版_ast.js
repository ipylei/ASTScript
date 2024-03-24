/* 
    插件18：https://wx.zsxq.com/dweb2/index/topic_detail/214255582511851
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


let jsfile = path.join(__dirname, "14_18_逻辑表达式转if_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

let ifNODETEP = template(`if(A){B;}`);
const LogicalToIfStatement =
{
	LogicalExpression(path) {
		let { node, parentPath } = path;
		if (!parentPath.isExpressionStatement({ "expression": node })) 
		{
			return;
		}

		let { left, operator, right } = node;
		let ifNode = "";
		if (operator == "||") {
			let UnaryNode = types.UnaryExpression(operator = "!",argument = left);
			ifNode = ifNODETEP({"A":UnaryNode,"B":right});
		}
		else if (operator == "&&") {
			ifNode = ifNODETEP({"A":left,"B":right});
		}
		else {
			return;
		}
		parentPath.replaceWith(ifNode);
	},

}


traverse(ast, LogicalToIfStatement);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

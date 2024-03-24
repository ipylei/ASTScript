/* 
	插件13：https://wx.zsxq.com/dweb2/index/topic_detail/814458844281122
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
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "13_变量声明与初始化合并_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const combinDefineAndNextAssgin =
{
	VariableDeclarator(path) {
		let { scope, node, parentPath } = path;
		let { id, init } = node;
		if (init != null) { 
			return; 
		}

		let name = id.name;
		let nextSibling = parentPath.getNextSibling();
		if (!nextSibling.isExpressionStatement()) {
			return;
		}
		let expression = nextSibling.node.expression;

		//非赋值语句直接return
		if (!types.isAssignmentExpression(expression)) {
			return;
		}

		let { left, operator, right } = expression;
		//是否可以合并
		if (!types.isIdentifier(left, { name: name }) || operator != "=") {
			return;
		}
		path.set("init", right);
		nextSibling.remove();
	}
}


traverse(ast, combinDefineAndNextAssgin);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

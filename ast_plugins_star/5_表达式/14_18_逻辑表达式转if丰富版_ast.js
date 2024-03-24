/* 
	插件18：https://wx.zsxq.com/dweb2/index/topic_detail/184242551524152
 */


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


let jsfile = path.join(__dirname, "14_18_逻辑表达式转if_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const LogicalToIfStatement =
{
	LogicalExpression(path) {
		let { node, parentPath } = path;
		if (!parentPath.isExpressionStatement()) {
			return;
		}
		let { left, operator, right } = node;

		let blockNode = types.BlockStatement([]);
		let newNode = types.BlockStatement([types.ExpressionStatement(right)])
		let ifNode = undefined;
		
		//将左节点作为条件，右节点看情况放入if块还是else块
		
		if (operator == "||") {
			//左边满足则不执行右边：if(left){blockNode}else{newNode}
			ifNode = types.IfStatement(left, blockNode, newNode);
		}
		else if (operator == "&&") {
			//左边满足则要执行右边
			ifNode = types.IfStatement(left, newNode, null);
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

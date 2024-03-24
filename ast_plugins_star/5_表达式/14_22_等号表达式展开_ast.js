/* 
	插件22：https://wx.zsxq.com/dweb2/index/topic_detail/184221242848582
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


let jsfile = path.join(__dirname, "14_22_等号表达式展开_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginAssignUnfold = {
	AssignmentExpression:
	{
		exit(path) {
			let { parentPath, node } = path;
			
			//必须是多个赋值的的情况
			if (!parentPath.isAssignmentExpression({ right: node, operator: "=" })) {
				return;
			}
			let { left, operator, right } = node;

			//操作符必须为=
			if (operator != "=") return;

			let expressionPath = path.findParent(p => p.isExpressionStatement());
			if (!expressionPath) { return; }

			expressionPath.insertBefore(types.ExpressionStatement(node));
			// 插入后的处理，需要补右边：c1 = c2 = c3 = c4 = function () { }; ==> 诸如c1 = c2 = c3 = c4;
			// path.replaceWith(left); //这种还是差了点意思
			path.replaceWith(right);
		}
	}
}


traverse(ast, pluginAssignUnfold);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

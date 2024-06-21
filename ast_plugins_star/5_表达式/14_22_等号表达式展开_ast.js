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
			if (!parentPath.isVariableDeclarator({ "init": node })
				&& !parentPath.isAssignmentExpression({ right: node, operator: "=" })
				// && !parentPath.isMemberExpression()
			) {
				return;
			}

			let { left, operator, right } = node;
			console.log(">>>>", path.toString());

			// let ancestorPath = path.findParent(p => p.isExpressionStatement());
			let ancestorPath = path.findParent(p => p.isStatement());
			if (!ancestorPath) { return; }

			// ancestorPath.insertBefore(types.ExpressionStatement(node));

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

			// 插入后的处理，需要补右边：c1 = c2 = c3 = c4 = function () { }; ==> 诸如c1 = c2 = c3 = c4;
			path.replaceWith(left);  // path.replaceWith(right); //这种还是差了点意思
		}
	}
}


traverse(ast, pluginAssignUnfold);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, {comments:false}).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

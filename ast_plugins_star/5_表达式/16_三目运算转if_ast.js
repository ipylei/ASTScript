/* 
	插件16：
		https://wx.zsxq.com/dweb2/index/topic_detail/214255582225581
		https://wx.zsxq.com/dweb2/index/topic_detail/415458222558588
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


let jsfile = path.join(__dirname, "16_三目运算转if_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
var ast = parse(code);
global.ast = ast;

let ifNODETEP = template(`if(A){B;}else{C;}`);
const ConditionToIf1 = {
	ConditionalExpression: {
		exit(path) {
			let { test, consequent, alternate } = path.node;
			let ifStateNode = ifNODETEP({ "A": test, "B": consequent, "C": alternate });
			path.replaceWithMultiple(ifStateNode);
			path.skip();
		}
	},
}
// traverse(ast, ConditionToIf1);

var count = 0;
const ConditionToIf2 = {
	ConditionalExpression: {
		enter(path) {
			count++;
			console.log("====>", path.toString());
			let { scope, node } = path;
			let { test, consequent, alternate } = node;
			//处理左边
			//如果左边是多个句子(即逗号表达式)
			if (types.isSequenceExpression(consequent)) {
				let expressions = consequent.expressions;
				let retBody = [];
				for (let expression of expressions) {
					retBody.push(types.ExpressionStatement(expression));
				}
				//添加上括号
				consequent = types.BlockStatement(retBody);
			}
			else {
				consequent = types.ExpressionStatement(consequent);
				//添加上括号
				consequent = types.BlockStatement([consequent]);
			}

			//处理右边
			//如果右边是多个句子(即逗号表达式)
			if (types.isSequenceExpression(alternate)) {
				let expressions = alternate.expressions;
				let retBody = [];
				for (let expression of expressions) {
					retBody.push(types.ExpressionStatement(expression));
				}
				alternate = types.BlockStatement(retBody);
			}
			else {
				alternate = types.ExpressionStatement(alternate);
				alternate = types.BlockStatement([alternate]);
			}

			let ifStateNode = types.IfStatement(test, consequent, alternate);
			path.replaceWithMultiple(ifStateNode);
			// path.replaceWith(ifStateNode);

			// scope.crawl();
			// path替换成功的话，此时path.toString()为"", 因为此时path.node已经不是ConditionalExpression类型了
			console.log("---->|||||||||", path.toString());
			path.skip(); //exit()遍历不加会堆栈溢出
			if (count >= 20) {
				path.stop();
			}

		}
	},

	// 测试专用
	IfStatement: {
		enter(path) {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			console.log(path.toString());
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
		}
	}
}
traverse(ast, ConditionToIf2);



// 测试专用
const ConditionToIf3 = {
	// ConditionalExpression: {
	// 	exit(path){
	// 		console.log("==>", path.toString());
	// 	}
	// }

	IfStatement: {
		enter(path) {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			console.log(path.toString());
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
		}
	}
}
// traverse(ast, ConditionToIf3);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

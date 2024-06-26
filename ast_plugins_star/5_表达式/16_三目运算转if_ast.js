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
const { exit } = require("process");
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


const ConditionToIf2 = {
	ConditionalExpression: {
		enter(path) {
			// console.log("-------->", path.toString());
			// console.log(">>>>>>>>>>>>>", path.type, path.node);

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
			let ret = path.replaceWithMultiple(ifStateNode);
			// path.replaceWith(ifStateNode);

			// console.log(">>>>>>>>>>>>>", path.type, path.node);

			path.skip(); //exit()遍历不加会堆栈溢出
		}
	}
}
// traverse(ast, ConditionToIf2);


var count = 0;
const ConditionToIfTest = {
	ConditionalExpression: {
		enter(path) {
			count++;
			console.log("条件表达式 enter:", count, "=>", path.toString());
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
			let ret = path.replaceWithMultiple(ifStateNode);
			// path.replaceWith(ifStateNode);


			//替换失败，则ret.toString()为空
			//替换成功，则ret.toString()为替换后的字符串
			// console.log("替换结果:", Boolean(ret.toString()), ret.type);

			// console.log("----------------------------------------------------------------------------------------");
			// console.log("替换的返回值: ", ret.toString());
			// console.log("----------------------------------------------------------------------------------------");

			//替换失败，则path.toString()不变
			//替换成功，则path.toString()为空
			// console.log("替换后的path: ", path.toString());

			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			console.log(generate(ast, { comments: false }).code);
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n");
			// path.skip();



			// scope.crawl();

			// path替换成功的话，此时path.toString()为"", 因为此时path.node已经不是ConditionalExpression类型了
			// path.skip(); //exit()遍历不加会堆栈溢出
			// path.skip(); //不再遍历其子节点
			// path.stop(); //不再进行后续向下遍历，但如果是exit()的方式，还是要回退的，参考下面count=1时的情况

			// if (count >= 5) {
			// 	path.stop();
			// }
		},

		exit(path) {
			console.log("条件表达式 exit", count, "=>", path.toString());
		}
	},

	// 测试专用
	IfStatement: {
		enter(path) {
			console.log(count, ">>>if enter~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			console.log(path.toString());
			console.log(count, "<<<if enter~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

		},

		exit(path) {
			console.log(count, ">>>if exit~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
			console.log(path.toString());
			console.log(count, "<<<if exit~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
		}
	}
}
traverse(ast, ConditionToIfTest);



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
const ouput = generate(ast, {
	"compact": false,  // 是否压缩代码
	"comments": false,  // 是否保留注释
	"jsescOption": { "minimal": true },  //Unicode转义
}).code
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

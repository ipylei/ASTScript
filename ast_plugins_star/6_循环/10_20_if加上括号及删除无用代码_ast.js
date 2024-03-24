/* 
    插件 20：https://wx.zsxq.com/dweb2/index/topic_detail/815524822454412
	功能:给代码块加上{}，移除僵尸代码

	before；
		插件：变量定义分离
		插件：逗号表达式展开
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


let jsfile = path.join(__dirname, "10_20_if加上括号及删除无用代码_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const SimplifyIfStatement = {
	"IfStatement"(path) {
		const consequent = path.get("consequent");
		const alternate = path.get("alternate");
		const test = path.get("test");
		const evaluateTest = test.evaluateTruthy();

		//给if加上{}
		if (!consequent.isBlockStatement()) {
			consequent.replaceWith(types.BlockStatement([consequent.node]));
		}
		//给else加上{}
		if (alternate.node !== null && !alternate.isBlockStatement()) {
			alternate.replaceWith(types.BlockStatement([alternate.node]));
		}

		//if语句块中为空{}
		if (consequent.node.body.length == 0) {
			//没有else就只相当于一个普通的语句
			if (alternate.node == null) {
				path.replaceWith(test.node);
			}
			//有else的情况
			else {
				//放入到if语句块中
				consequent.replaceWith(alternate.node);
				alternate.remove();
				path.node.alternate = null;

				//将条件置反
				test.replaceWith(types.unaryExpression("!", test.node, true));
			}
		}
		
		//else语句块中为空{}，则直接删除
		if (alternate.isBlockStatement() && alternate.node.body.length == 0) {
			alternate.remove();
			path.node.alternate = null;
		}

		//替换为if语句块
		if (evaluateTest === true) {
			path.replaceWithMultiple(consequent.node.body);
		}

		//替换为else语句块
		else if (evaluateTest === false) {
			alternate.node === null ? path.remove() : path.replaceWithMultiple(alternate.node.body);
		}
	},
}
traverse(ast, SimplifyIfStatement);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时");

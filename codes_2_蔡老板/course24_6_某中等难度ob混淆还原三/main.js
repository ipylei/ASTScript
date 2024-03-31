const fs = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;


//js混淆代码读取
process.argv.length > 2 ? encodeFile = process.argv[2] : encodeFile = "./encode.js";  //默认的js文件
process.argv.length > 3 ? decodeFile = process.argv[3] : decodeFile = encodeFile.slice(0, encodeFile.length - 3) + "_ok.js";

//将源代码解析为AST
let sourceCode = fs.readFileSync(encodeFile, { encoding: "utf-8" });
let ast = parser.parse(sourceCode);
console.time("处理完毕，耗时");

const dealWithSpCall =
{
	FunctionDeclaration(path) {
		let { scope, node } = path;
		let { id, params, body } = node;

		if (id.name != "__p_3491553112_calc")
		{
			return;
		}

		let opObj = {"21":"!","-20":"-","3":"typeof","36":"void","-37":"~"}; //手动收集更快。

		let binding = scope.getBinding(id.name);
		if (!binding || !binding.constant) return;
		let { referencePaths } = binding;

		let canRemoved = true;
		for (let referPath of referencePaths.reverse()) {
			
			let { parentPath, node } = referPath;
			if (!parentPath.isCallExpression({ "callee": node })) {
				canRemoved = false;
				continue;
			}

			let argumentPaths = parentPath.get('arguments');

			if (argumentPaths.length != 2) {
				canRemoved = false;
				continue
			}

			let secondArgPath = argumentPaths[1];

			let key = "";

			if (secondArgPath.isCallExpression()) {
				key = 'arguments.0';
			}
			else if (secondArgPath.isAssignmentExpression()) {
				key = 'right';
			}
			else
			{
				canRemoved = false;
				break;
			}

			let { confident, value } = secondArgPath.get(key).evaluate();

			if (!confident) 
			{
				canRemoved = false;
				continue; //无法计算出结果，直接返回
			}

			let op = opObj[value];
			console.log(parentPath.toString(),op);
			let newNode = types.UnaryExpression(operator = op, argument = argumentPaths[0].node, prefix = true);
			parentPath.replaceWith(newNode);

		}

		canRemoved && path.remove();

	}
}

traverse(ast, dealWithSpCall);

const constantFold = {

	"Identifier|BinaryExpression|UnaryExpression"(path) {
		if (path.isUnaryExpression({ operator: "-" }) ||
			path.isUnaryExpression({ operator: "void" })) {
			return;
		}

		let { confident, value } = path.evaluate();

		if (!confident) return; //无法计算出结果，直接返回

		let valueType = typeof value;

		if (!["number", "string", "boolean"].includes(valueType)) {
			return;
		}
		if (valueType == 'number' && (!Number.isFinite(value))) { //过滤掉 1/0 这种情况，否则会导致堆栈溢出。
			return;
		}

		path.replaceWith(types.valueToNode(value))

	}
}

traverse(ast, constantFold);


console.timeEnd("处理完毕，耗时");
let { code } = generator(ast, opts = {
	"compact": false,  // 是否压缩代码
	"comments": false,  // 是否保留注释
	"jsescOption": { "minimal": true },  //Unicode转义
});

fs.writeFile(decodeFile, code, (err) => { });
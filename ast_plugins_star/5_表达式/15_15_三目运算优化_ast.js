/* 
    插件15：https://wx.zsxq.com/dweb2/index/topic_detail/814458841288412
    限制：只对赋值语句有效
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


let jsfile = path.join(__dirname, "15_15_三目运算优化_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const TransConditionOfAssignment = 
{
	ConditionalExpression(path)
	{
		let {parentPath,node} = path;
		let {test, consequent, alternate} = node;

    //只对赋值语句生效？
    if (parentPath.isAssignmentExpression({"right":node})) 
    {
    	let {operator, left} = parentPath.node;

    	consequent = types.AssignmentExpression(operator, left, consequent);
      alternate =  types.AssignmentExpression(operator, left, alternate);
      parentPath.replaceWith(types.conditionalExpression(test, consequent, alternate));
    }
 },
}

traverse(ast, TransConditionOfAssignment);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

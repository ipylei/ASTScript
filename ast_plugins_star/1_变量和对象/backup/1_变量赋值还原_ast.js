/*  
    插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418822184214
    
    before

    after：
        插件：2_常量折叠

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

const { isNodeLiteral, isNodePure } = require("../../0_utils");

console.time("处理完成，耗时");
let jsfile = path.join(__dirname, "1_变量赋值还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const pluginAssignmentRestore =
{//常量还原插件
    AssignmentExpression(path) {
        let { scope, node, parentPath } = path;
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || operator != "=") {
            return;
        }

        let is_literal = isNodeLiteral(right);
        let is_pure = isNodePure(right, scope);
        console.log("============================>");
        console.log(path.toString());
        console.log("is_literal:", is_literal);
        console.log("is_pure:", is_pure);
        console.log("<============================\n");
        if (!is_pure) {
            return;
        }
        let binding = scope.getBinding(left.name);
        if (!binding || binding.constantViolations.length > 1) {//如果没有binding,或者赋值语句本身改变了它，因此这里判断只有一处改变。
            return;
        }
        for (let referPath of binding.referencePaths) {
            referPath.replaceWith(right);
        }
        if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
            path.remove();
        }
    },

}


traverse(ast, pluginAssignmentRestore);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

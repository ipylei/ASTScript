/* 
    插件12：https://wx.zsxq.com/dweb2/index/topic_detail/185228851218512
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


let jsfile = path.join(__dirname, "函数表达式替换为函数定义_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginVarDeclarToFuncDeclar =
{
    VariableDeclaration(path) {
        let { parentPath, node, scope } = path;
        //过滤掉部分特殊情况，例如for循环里的变量定义
        if (!parentPath.isBlock()) {
            return;
        }

        //var a=function(){}, b=function(){}，即declarations.length != 1。这种情况可以先使用变量定义分离隔开。
        let { declarations, kind } = node;
        if (declarations.length != 1) {
            return;
        }

        let { id, init } = declarations[0];
        if (!types.isFunctionExpression(init)) {
            return;
        }

        let { params, body } = init;
        let newNode = types.FunctionDeclaration(id, params, body);
        path.replaceWith(newNode);
        scope.crawl();
    }
}

traverse(ast, pluginVarDeclarToFuncDeclar);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

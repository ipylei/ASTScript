/* 
    插件 
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


let jsfile = path.join(__dirname, "8_简单还原CallExpression_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);
// console.log(">>>>>", ast);

const visitor = {
    VariableDeclarator(path) {
        const init = path.get("init");
        if (init.isFunctionExpression()) {

            // 1.获取函数名
            const { init, id } = path.node;
            const name = id.name;

            // 2.获取参数，并判断长度:
            const params = init.params;
            if (params.length != 2) return;
            let first_arg = params[0].name;
            let second_arg = params[1].name;

            // 3.判断函数体长度是否为1
            const body = init.body;
            if (!body.body || body.body.length !== 1) return;

            // 4.判断 ReturnStatement 及其 参数类型
            let return_body = body.body[0];
            let argument = return_body.argument;
            if (!types.isReturnStatement(return_body) || !types.isBinaryExpression(argument)) {
                return;
            }

            // 5.判断函数的形式参数与 return语句的参数是否一致:
            let { left, right, operator } = argument;
            if (!types.isIdentifier(left, { name: first_arg }) || !types.isIdentifier(right, { name: second_arg })) {
                return;
            }

            // 6.函数声明所在的作用域:
            let scope = path.scope;
            traverse(scope.block, {
                CallExpression: function (_path) {
                    let _node = _path.node;
                    let args = _path.node.arguments;
                    if (args.length === 2 && types.isIdentifier(_node.callee, { name: name })) {
                        _path.replaceWith(types.BinaryExpression(operator, args[0], args[1]))
                    }
                },
            })

        }
    }
}


traverse(ast, visitor);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

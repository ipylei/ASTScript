/* 
    插件28：https://wx.zsxq.com/dweb2/index/topic_detail/218288141552411
    函数体只有一个return语句，且传入的实参不为字面量

    before:
        9_9_简单函数调用替换为结果
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


let jsfile = path.join(__dirname, "9_28_单return函数还原为函数体_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const reSolveFunctionExpression = {
    "VariableDeclarator|FunctionDeclaration"(path) {
        let { scope, node } = path;
        let id = node.id;
        const binding = path.scope.getBinding(id.name);
        if (!binding || !binding.constant)
            return;

        let params, body;
        if (path.isVariableDeclarator()) {
            let init = node.init;
            if (!types.isFunctionExpression(init)) {
                return;
            }
            params = init.params;
            body = init.body;
        } else {
            params = node.params;
            body = node.body;
        }

        //函数体只有一个Return语句
        if(body.body.length !== 1 ||  !types.isReturnStatement(body.body[0])){
            return;
        }

        let referPaths = binding.referencePaths;
        //形参参数为1，且函数体为一元表达式
        if (params.length == 1 && types.isUnaryExpression(body.body[0].argument)) {
            let { operator, argument } = body.body[0].argument;
            if (!types.isIdentifier(argument, { name: params[0].name })) {
                return;
            }
            let canbeRemoved = true;
            for (let referPath of referPaths) {
                let callPath = referPath.findParent(p => p.isCallExpression());
                let { callee, arguments } = callPath.node;
                //匹配实参
                if (!types.isIdentifier(callee, { name: id.name }) || arguments.length != 1) {
                    canbeRemoved = false;
                    continue;
                }
                let UnaryNode = types.UnaryExpression(operator, arguments[0]);
                callPath.replaceWith(UnaryNode);
                callPath.scope.crawl();
            }
            canbeRemoved && path.remove();
            return;
        }
        //形参参数为2，且函数体为二元表达式
        if (params.length == 2 && types.isBinaryExpression(body.body[0].argument)) {
            let { left, operator, right } = body.body[0].argument;
            if (!types.isIdentifier(left, { name: params[0].name }) || !types.isIdentifier(right, { name: params[1].name })) {
                return;
            }
            let canbeRemoved = true;
            for (let referPath of referPaths) {
                let callPath = referPath.findParent(p => p.isCallExpression());
                let { callee, arguments } = callPath.node;
                //匹配实参
                if (!types.isIdentifier(callee, { name: id.name }) || arguments.length != 2) {
                    canbeRemoved = false;
                    continue;
                }
                let BinaryNode = types.BinaryExpression(operator, arguments[0], arguments[1]);
                callPath.replaceWith(BinaryNode);
                callPath.scope.crawl();
            }

            canbeRemoved && path.remove();
            return;
        }

        //TODO：实参参数为3?

    },
}



traverse(ast, reSolveFunctionExpression);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

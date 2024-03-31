/* 
    插件21：https://wx.zsxq.com/dweb2/index/topic_detail/814484118811542

    使用场景：
        1.有的分支永远都不会执行到，可以删除
        2.有的变量或函数定义也没有地方使用，可以删除

    before：
        插件：三目运算符转if

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
const { isNodeLiteral, isNodePure, color } = require("./0_utils");


console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "10_21_删除垃圾代码_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


const pluginRemoveDeadCode = {
    //if语句、三目运算符
    "IfStatement|ConditionalExpression"(path) {
        let { consequent, alternate } = path.node;
        let testPath = path.get('test');
        const evaluateTest = testPath.evaluateTruthy();
        //直接替换为满足条件
        if (evaluateTest === true) {
            if (types.isBlockStatement(consequent)) {
                consequent = consequent.body;
            }
            path.replaceWithMultiple(consequent);
            return;
        }
        //直接替换为不满足条件的
        if (evaluateTest === false) {
            if (alternate != null) {
                if (types.isBlockStatement(alternate)) {
                    alternate = alternate.body;
                }
                path.replaceWithMultiple(alternate);
            }
            else {
                console.log(node.loc.start.line);
                path.remove();
            }
        }
    },

    //逻辑表达式 a&&b
    "LogicalExpression"(path) {
        let { left, operator, right } = path.node;
        let leftPath = path.get('left');
        const evaluateLeft = leftPath.evaluateTruthy();

        if ((operator == "||" && evaluateLeft == true) || (operator == "&&" && evaluateLeft == false)) {
            path.replaceWith(left);
            return;
        }
        if ((operator == "||" && evaluateLeft == false) || (operator == "&&" && evaluateLeft == true)) {
            path.replaceWith(right);
        }
    },

    //空语句、debugger；
    "EmptyStatement|DebuggerStatement"(path) {
        console.log(path.node.loc.start.line);
        path.remove();
    },

    // case continue之后的语句删除
    "ContinueStatement"(path){
        if(!path.parentPath.isSwitchCase()){
            return;
        }
        //获取后续的兄弟节点
        let allNextSiblings = path.getAllNextSiblings();
        for(let nextSibling of allNextSiblings){
            nextSibling.remove();
        }
    },

    //变量声明语句
    "VariableDeclarator"(path) {
        let { node, scope, parentPath } = path;
        if (!parentPath.parentPath.isBlock()) {//过滤for..of等在循环内声明的变量语句
            return;
        }

        let { id, init } = node;
        //目前只发现赋值语句和调用语句会有问题。后续待添加
        if (!types.isIdentifier(id) || types.isCallExpression(init) || types.isAssignmentExpression(init)) {
            return;
        }

        //重新解析ast后，一定会有binding;
        let binding = scope.getBinding(id.name);
        let { referenced, constant, constantViolations } = binding;
        if (!referenced) {
            console.log(node.loc.start.line);
            path.remove();
        }
    },


    //赋值语句，有绑定，但引用数为0
    "AssignmentExpression"(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement({ "expression": node })) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || operator != "=") {
            return;
        }

        let binding = scope.getBinding(left.name);
        if (binding && !binding.referenced) {
            console.log(node.loc.start.line);
            parentPath.remove();
        }
    },

    //函数声明语句
    FunctionDeclaration(path) {
        let { node, parentPath } = path;
        let { id, body } = node;
        const binding = parentPath.scope.getBinding(id.name);
        if (binding && !binding.referenced) {
            console.log(node.loc.start.line);
            path.remove();
        }
    }

}
traverse(ast, pluginRemoveDeadCode);



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

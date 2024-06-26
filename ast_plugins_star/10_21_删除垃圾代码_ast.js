/* 
    插件21：https://wx.zsxq.com/dweb2/index/topic_detail/814484118811542

    使用场景：
        1.有的分支永远都不会执行到，可以删除
        2.有的变量或函数定义也没有地方使用，可以删除

    before：
        插件：三目运算符转if
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
const { isNodeLiteral, isNodePure, color } = require("./0_utils");


console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "10_21_删除垃圾代码_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


function containsSequenceExpression(path) {
    let containsSequence = false;
    // 深度优先遍历当前路径及其所有子路径
    path.traverse({
        "SequenceExpression|AssignmentExpression"(_path) {
            containsSequence = true;
            _path.stop(); // 找到逗号表达式后立即停止遍历
        },
    });
    return containsSequence;
}


const pluginRemoveDeadCode = {
    //if语句、三目运算符
    "IfStatement|ConditionalExpression"(path) {
        let { consequent, alternate } = path.node;
        let testPath = path.get('test');

        //不处理逗号表达式，赋值语句防止误删
        if (testPath.isSequenceExpression() || testPath.isAssignmentExpression() || containsSequenceExpression(testPath)) {
            return;
        }


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
                // console.log(node.loc.start.line);
                console.log("删除垃圾代码", path.node.loc.start.line);
                path.remove();
            }
        }
    },

    //逻辑表达式 a&&b
    "LogicalExpression"(path) {
        let { left, operator, right } = path.node;
        let leftPath = path.get('left');
        //不处理逗号表达式，赋值语句防止误删
        if (leftPath.isSequenceExpression() || leftPath.isAssignmentExpression() || containsSequenceExpression(leftPath)) {
            return;
        }
        
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
        console.log("删除垃圾代码", path.node.loc.start.line);
        path.remove();
    },


    //变量声明语句
    "VariableDeclarator"(path) {
        let { node, scope, parentPath, parent } = path;
        let ancestryPath = parentPath.parentPath;
        //目前发现这两个需要过滤  (for...of,  for...in)
        if (ancestryPath.isForOfStatement({ left: parent }) || ancestryPath.isForInStatement({ left: parent })) {
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
        if (referenced || constantViolations.length > 1) {
            return;
        }
        if (constant || constantViolations[0] == path) {
            console.log("删除垃圾代码", path.node.loc.start.line);
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
    },

    //continue、break、return、throw 后面的兄弟节点
    //如删除 continue; a +=2; a++; continue; = > continue;
    "ContinueStatement|BreakStatement|ReturnStatement|ThrowStatement"(path) {
        let AllNextSiblings = path.getAllNextSiblings();  //获取所有的后续兄弟节点
        for (let nextSibling of AllNextSiblings) {
            //变量提升.....
            if (nextSibling.isFunctionDeclaration() || nextSibling.isVariableDeclaration({ kind: "var" })) {
                continue;
            }
            nextSibling.remove();
        }
    },
}
traverse(ast, pluginRemoveDeadCode);



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

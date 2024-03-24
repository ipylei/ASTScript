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

let { isNodeLiteral } = require("./0_utils");

console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "无效函数删除_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

// 方法被引用的地方
// const test_plugin = {
//     FunctionDeclaration: {
//         enter(path) {
//             console.log("====》");
//             let { node, scope } = path;
//             let { id } = node;
//             // 方法名
//             let func_name = id.name;
//             let binding = scope.getBinding(func_name);           //有绑定
//             if (!binding || !binding.constant) {
//                 console.log(path.toString());
//                 return;
//             }

//         }
//     }
// }

// traverse(ast, test_plugin);


//函数被调用， 要么在自身里面调用，要么调用的地方都没有返回值(且实参是空，字面量都不行)

const pluginDeleteInvalidCall = {
    CallExpression(path) {
        let { node, parentPath, scope } = path;
        let { callee, arguments } = node;
        if (isNodeLiteral(arguments) && parentPath.isExpressionStatement()) {
            // console.log(parentPath.toString());

            let binding = scope.getBinding(callee.name);
            if (!binding) {
                // console.log("~~~~~~~~", parentPath.toString());
                return;
            }
            console.log(binding.toString());

            let { referencePaths, constant } = binding;
            // console.log(binding.path.toString());
            // console.log(binding.path.type);

            let bindingPath = binding.path;
            // if(bindingPath.isVariableDeclarator(path)){
            // }

            console.log(binding.referencePaths.length);
            can_remove = true;
            for (let referPath of referencePaths) {
                // console.log(referPath.toString());
                if (bindingPath.isAncestor(referPath)) {
                    continue;
                }
                // console.log(referPath.parentPath.toString());
                // console.log(referPath.parentPath.type);

                let referParentPath = referPath.parentPath;
                let referParentNode = referParentPath.node;
                if (!isNodeLiteral(referParentNode.arguments)) {
                    console.log("====>", referParentPath.toString());
                    can_remove = false;
                } else {
                    referParentPath.parentPath.remove();
                }
            }
            console.log(can_remove);
            if (can_remove) {
                bindingPath.parentPath.remove();
            }
        }
    }
}

traverse(ast, pluginDeleteInvalidCall);

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

    //变量声明语句
    "VariableDeclarator"(path) {
        let { node, scope, parentPath } = path;
        if (!parentPath.parentPath.isBlock()) {//过滤for..of等在循环内声明的变量语句
            return;
        }

        let { id, init } = node;
        //目前只发现赋值语句和调用语句会有问题。后续待添加
        if (!types.isIdentifier(id) || types.isAssignmentExpression(init)) {
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


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

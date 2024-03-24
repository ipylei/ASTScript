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
const { isNodeLiteral, isNodePure, color } = require("../../ast_plugins_star/0_utils");

console.time("处理完成，耗时");


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "input.js");

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);

// 【*】 常量折叠
const pluginConstantFold2 = {
    //"Identifier"可以还原变量定义
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
                return;
            }
            const { confident, value } = path.evaluate();
            if (!confident) { return; }
            if (typeof value == 'number' && (!Number.isFinite(value))) { return; }
            if (path.isIdentifier() && typeof value == "object") { return; }
            console.log(path.node.loc.start.line, path.toString(), "===>", value);
            path.replaceWith(types.valueToNode(value));
        }
    },
}
// traverse(ast, pluginConstantFold2);



// 【*】 逗号表达式还原
const standardLoop =
{
    //循环语句加上{}
    "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
        if (!types.isBlockStatement(node.body)) {
            node.body = types.BlockStatement([node.body]);
        }
    },

    //处理if
    IfStatement(path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        //给if加上{}
        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.BlockStatement([consequent.node]));
        }
        //给else加上{}
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.BlockStatement([alternate.node]));
        }
    },
}
// traverse(ast, standardLoop);
// (星球)逗号表达式(丰富版) https://wx.zsxq.com/dweb2/index/topic_detail/214818122115541
function SequenceOfStatement(path) {
    let { scope, parentPath, node } = path;
    let ancestorPath = parentPath.parentPath;
    if (ancestorPath.isLabeledStatement()) { //标签节点无法往前插入。
        return;
    }
    let expressions = node.expressions;

    //情况(return语句)：function func(){ return a=1, b=2, c=3;}
    if (parentPath.isReturnStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原return语句中包含的逗号表达式");
    }
    //情况(常规)：a=1,b=2,c=3;
    else if (parentPath.isExpressionStatement({ "expression": node })) {
        parentPath.node.expression = expressions.pop();
        console.log("还原常规语句中包含的逗号表达式");
    }
    //情况(函数调用)：(a = 2, b = 3, c = 4, d = 6, d=7,func)(2,3)
    else if (parentPath.isCallExpression({ "callee": node })) {
        parentPath.node.callee = expressions.pop();
        console.log("还原函数调用中包含的逗号表达式");
    }
    //情况(抛出异常)：throw a = 2, b = 3, c = 4, d = 6, d=7;
    else if (parentPath.isThrowStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原throw语句中包含的逗号表达式");
    }
    //情况(if)：if(a = 2, b = 3, c = 4, d = 6, d=7){}    
    else if (parentPath.isIfStatement({ "test": node })) {
        if (parentPath.key === "alternate") {
            console.log("排除else if的情况, 建议先使用if语句展开插件");
            return;
        }
        parentPath.node.test = expressions.pop();
        console.log("还原if语句中包含的逗号表达式");
    }
    //情况(while)：while(a = 2, b = 3, c = 4, d = 6, d=7){}    
    else if (parentPath.isWhileStatement({ "test": node })) {
        parentPath.node.test = expressions.pop();
        console.log("还原while语句中包含的逗号表达式");
    }
    //情况(for)：for(a = 2, b = 3, c = 4, d = 6, d=7;;){}
    else if (parentPath.isForStatement({ "init": node })) {
        parentPath.node.init = expressions.pop();
        console.log("还原for语句中包含的逗号表达式");
    }
    //情况(switch)：switch(a = 2, b = 3, c = 4, d = 6, d=7){}
    else if (parentPath.isSwitchStatement({ "discriminant": node })) {
        parentPath.node.discriminant = expressions.pop();
        console.log("还原switch语句中包含的逗号表达式");
    }
    //情况(for ... in)：for(let b1 in a=3,b=4,c=5){}
    else if (parentPath.isForInStatement({ "right": node })) {
        parentPath.node.right = expressions.pop();
        console.log("还原for...in语句中包含的逗号表达式");
    }
    else {
        return;
    }

    //前面是把最后一项保留下来，这里是把其他的都插入到前面去
    for (let expression of expressions) {
        parentPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}
function SequenceOfExpression(path) {
    let { scope, parentPath, node, parent } = path;
    let ancestorPath = parentPath.parentPath;
    let expressions = node.expressions;

    //情况：(a=1,b=2,c=3,d==3)?true:false;
    if (parentPath.isConditionalExpression({ "test": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.test = expressions.pop();
        console.log("还原三目运算符中前面包含的逗号表达式");
    }
    //情况：var ret = (a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isVariableDeclarator({ "init": node }) && ancestorPath.parentPath.isBlock()) {
        parentPath.node.init = expressions.pop();
        console.log("还原(单个)变量声明中包含的逗号表达式");
    }
    //情况：ret = (a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isAssignmentExpression({ "right": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.right = expressions.pop();
        console.log("还原(单个)变量赋值语句中的逗号表达式");
    }
    //情况：!(a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isUnaryExpression({ "argument": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原一元表达式中的逗号表达式");
    } else {
        return;
    }

    //前面是把最后一项保留下来，这里是把其他的都插入到前面去
    for (let expression of expressions) {
        ancestorPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}
const pluginCommaUnfold2 = {
    SequenceExpression: { //对同一节点遍历多个方法
        exit: [SequenceOfStatement, SequenceOfExpression]
    }
}
// traverse(ast, pluginCommaUnfold2); //丰富版



// 【*】 变量引用还原
const pluginVarReferenceRestore = {
    // 插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418484544454
    VariableDeclarator(path) {
        let { scope, parentPath } = path;
        let { id, init } = path.node;
        //var a=x; 左边a必须为标识符，右边必须是纯节点
        if (!types.isIdentifier(id) || !isNodePure(init, scope)) {
            return;
        }
        const binding = scope.getBinding(id.name);
        if (!binding) { return; }

        let { constant, referencePaths, constantViolations } = binding;
        if (constantViolations.length > 1) { return; }

        //如果没改变过; 或者只改变了一次(var a = 10; var a = 5;) 
        // if (constant || (constantViolations.length === 1 && constantViolations[0] == path)) {
        if (constant) {
            var referCount = referencePaths.length;
            for (let referPath of referencePaths) {
                // console.log(referPath.toString(), '<--->', generate(init).code);
                referPath.replaceWith(init);
                referCount--;
                // console.log("变量声明语句还原");
            }

            if (referCount == 0) {
                path.remove(); //没有被引用，或者替换完成，可直接删除
            } else {
                console.log("还有被引用的地方", path.toString());
            }

        }
    },

    // 插件1：https://wx.zsxq.com/dweb2/index/topic_detail/584418822184214
    AssignmentExpression: {
        exit(path) {
            let { scope, node, parentPath } = path;
            let { left, operator, right } = node;
            if (!types.isIdentifier(left) || operator != "=" || !isNodePure(right, scope)) {
                return;
            }
            let binding = scope.getBinding(left.name);
            if (!binding) { return; }
            let { constant, referencePaths, constantViolations } = binding;

            //如果没有binding,或者赋值语句本身改变了它，因此这里判断只有一处改变。
            if (constantViolations.length > 1) { return; }
            if (constantViolations.length === 1 && constantViolations[0] !== path) { return; }

            var referCount = referencePaths.length;
            for (let referPath of referencePaths) {
                // console.log(referPath.toString(), '<--->', generate(right).code);
                referPath.replaceWith(right);
                referCount--;
                // console.log("变量赋值语句还原");
            }

            // if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
            //     path.remove();
            // }

            if (referCount == 0) {
                //满足这个条件时，顺便将绑定path也删除
                if (binding.path.isVariableDeclarator() && binding.path.node.init == null) {
                    binding.path.remove();
                }

                //排除以下情况：($ = 9) * (f = 10)
                if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
                    path.remove(); //没有被引用，或者替换完成，可直接删除
                }
                //处理以下情况： ($ = 9) * (f = 10) 
                else if (parentPath.isBinaryExpression()) {
                    path.replaceWith(right);
                }

            } else {
                console.log("还有被引用的地方", path.toString());
            }
        }
    },
}
// traverse(ast, pluginVarReferenceRestore);


// 【*】 常量折叠
traverse(ast, pluginConstantFold2);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputFile = path.join(__dirname, "output1_常量折叠.js");
// let outputFile = path.join(__dirname, "output2_逗号表达式还原.js");
// let outputFile = path.join(__dirname, "output3_变量赋值语句还原.js");
let outputFile = path.join(__dirname, "output4_常量折叠.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : outputFile;
console.log("decodeFile ===> ", decodeFile);
fs.writeFile(decodeFile, ouput, (err) => { });

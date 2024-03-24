/* 
    逗号表达式
        注：可以在插件=>for语句展开_ast.js，之后使用

    逗号表达式之声明：var c1 = 1, c2 = 2, c3 = 3;
    逗号表达式之赋值：d1 = 4, d2 = 5, d3 = 6;
 */

// import { parse } from "@babel/parser";
// import fs from "fs";

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

let jsfile = path.join(__dirname, "逗号表达式展开_code.js");

const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");

// (星球)循环规范表达式 // https://wx.zsxq.com/dweb2/index/topic_detail/418888552455128
const standardLoop = {
    "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({
        node
    }) {
        if (!types.isBlockStatement(node.body)) {
            node.body = types.BlockStatement([node.body]);
        }
    },
    IfStatement(path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.BlockStatement([consequent.node]));
        }
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.BlockStatement([alternate.node]));
        }
    },
}

// (星球)if表达式 // https://wx.zsxq.com/dweb2/index/topic_detail/815524822454412
const SimplifyIfStatement = {
    "IfStatement"(path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        const test = path.get("test");
        const evaluateTest = test.evaluateTruthy();

        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.BlockStatement([consequent.node]));
        }
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.BlockStatement([alternate.node]));
        }

        if (consequent.node.body.length == 0) {
            if (alternate.node == null) {
                path.replaceWith(test.node);
            } else {
                consequent.replaceWith(alternate.node);
                alternate.remove();
                path.node.alternate = null;
                test.replaceWith(types.unaryExpression("!", test.node, true));
            }
        }

        if (alternate.isBlockStatement() && alternate.node.body.length == 0) {
            alternate.remove();
            path.node.alternate = null;
        }

        if (evaluateTest === true) {
            path.replaceWithMultiple(consequent.node.body);
        } else if (evaluateTest === false) {
            alternate.node === null ? path.remove() : path.replaceWithMultiple(alternate.node.body);
        }
    },
}

// (星球)逗号表达式(简易版) https://wx.zsxq.com/dweb2/index/topic_detail/418528444114288
const resolveSequence = {
    SequenceExpression(path) {
        let {
            scope,
            parentPath,
            node
        } = path;
        let expressions = node.expressions;
        if (parentPath.isReturnStatement({
            "argument": node
        })) {
            let lastExpression = expressions.pop();
            for (let expression of expressions) {
                parentPath.insertBefore(types.ExpressionStatement(expression = expression));
            }

            path.replaceInline(lastExpression);
        } else if (parentPath.isExpressionStatement({
            "expression": node
        })) {
            let body = [];
            expressions.forEach(express => {
                body.push(types.ExpressionStatement(express));
            });
            path.replaceWithMultiple(body);
        } else {
            return;
        }

        scope.crawl();
    }
}

// (星球)逗号表达式(丰富版) https://wx.zsxq.com/dweb2/index/topic_detail/214818122115541
function SequenceOfStatement(path) {
    let { scope, parentPath, node } = path;
    let ancestorPath = parentPath.parentPath;
    if (ancestorPath.isLabeledStatement()) { //标签节点无法往前插入。
        return;
    }
    let expressions = node.expressions;
    if (parentPath.isReturnStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
    } else if (parentPath.isThrowStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
    } else if (parentPath.isIfStatement({ "test": node }) || parentPath.isWhileStatement({ "test": node })) {
        parentPath.node.test = expressions.pop();
    } else if (parentPath.isForStatement({ "init": node })) {
        parentPath.node.init = expressions.pop();
    } else if (parentPath.isForInStatement({ "right": node })) {
        parentPath.node.right = expressions.pop();
    } else if (parentPath.isSwitchStatement({ "discriminant": node })) {
        parentPath.node.discriminant = expressions.pop();
    } else if (parentPath.isCallExpression({ "callee": node })) {
        parentPath.node.callee = expressions.pop();
    } else if (parentPath.isExpressionStatement({ "expression": node })) {
        parentPath.node.expression = expressions.pop();
    } else {
        return;
    }
    for (let expression of expressions) {
        parentPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}

function SequenceOfExpression(path) {

    let { scope, parentPath, node, parent } = path;
    let ancestorPath = parentPath.parentPath;
    let expressions = node.expressions;
    if (parentPath.isConditionalExpression({ "test": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.test = expressions.pop();
    } else if (parentPath.isVariableDeclarator({ "init": node }) && ancestorPath.parentPath.isBlock()) {
        parentPath.node.init = expressions.pop();
    } else if (parentPath.isAssignmentExpression({ "right": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.right = expressions.pop();
    } else if (parentPath.isUnaryExpression({ "argument": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.argument = expressions.pop();
    } else {
        return;
    }

    for (let expression of expressions) {
        ancestorPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}

const resolveSequence2 = {
    SequenceExpression: { //对同一节点遍历多个方法
        exit: [SequenceOfStatement, SequenceOfExpression]
    }
}


/* 非星球*/
const forPlugin = {
    // ForStatement(path) {
    ForStatement: {
        exit(path) {
            console.log("enter forPlugin-> ForStatement");

            let { parentPath, node, scope } = path;
            let { init, test, update, body } = node;
            //对于for循环：
            //1.把update语句放到请求体里面去，然后将update部分置为空
            //2.把init中的语句放到for循环之前，然后将init部分置为空
            //3.将逗号表达式改为分号结构

            //1.把update语句放到请求体里面去，然后将update部分置为空

            let initPath = path.get("init");
            let updatePath = path.get("update");
            let bodyPath = path.get("body");
            if (bodyPath.isEmptyStatement()) {
                bodyPath.replaceWith(types.blockStatement([]));
            }


            //1.把update语句放到请求体里面去，然后将update部分置为空
            if (update && bodyPath.isBlockStatement()) {
                let insertByUpdate = [];
                //如果更新体是语句的情况下
                if (update.type == "SequenceExpression") {
                    // insertItems = update.expressions
                    for (let expres of update.expressions) {
                        insertByUpdate.push(types.expressionStatement(expres));
                    }
                } else {
                    insertByUpdate.push(types.expressionStatement(update));
                }

                let bodyNode = bodyPath.node;
                bodyNode.body.splice(bodyNode.body.length, 0, ...insertByUpdate);
                // updatePath.remove();
                path.node.update = null;
            }

            //2.把init中的语句放到for循环之前，然后将init部分置为空
            if (init) {
                let insertByInit = [];
                if (init.type == "VariableDeclaration") {
                    path.insertBefore(init);
                }
                else {
                    if (init.type == "SequenceExpression") {
                        for (let expres of init.expressions) {
                            insertByInit.push(types.expressionStatement(expres));
                        }
                    }
                    else {
                        insertByInit.push(types.expressionStatement(init));
                    }

                    for (let item of insertByInit) {
                        path.insertBefore(item);
                    }
                }
                path.node.init = null;
            }
        }
    }
};

const commaPlugin = {
    //情况1：var a = 1, b=2, c=3;
    VariableDeclaration: {
        enter(path) {
            console.log("enter commaPlugin-> VariableDeclaration");
            let { parentPath, node } = path;
            if (parentPath.isForStatement({ "init": node })) {
                console.log("VariableDeclaration-> 在for语句init里面!");
                return;
            }
            if (node.declarations.length < 2) {
                console.log("VariableDeclaration-> for语句init中数量<2不处理");
                return;
            }
            // console.log("===>\n", path.toString(), "<===\n");

            //i=1开始，保留最后一项，前面的依次弹出
            let length = node.declarations.length;
            for (let i = 1; i < length; i++) {
                path.insertBefore(types.variableDeclaration(node.kind, [node.declarations.shift()]));
            }

            /* 
            //另一种实现方式
            let {declarations} = node;
            let lastDeclaration = declarations.pop();
            for(let declaration of declarations){
                path.insertBefore(types.variableDeclaration(node.kind, [declaration]));
            }
            path.node.declarations = [lastDeclaration]; 
            */
        }
    },

    //情况2：d=4,e=5,k=6;
    SequenceExpression: {
        enter(path) {
            console.log("enter commaPlugin -> SequenceExpression");
            let { parentPath, node, scope } = path;
            if (!node.expressions) {
                return;
            }
            //逻辑运算里面, 暂不处理，比如: 0 == H && (H = j, G = o(I++))
            if (parentPath.isLogicalExpression()) {
                console.log("SequenceExpression-> 在逻辑运算里面!");
                return;
            }
            //在for语句init里面，由for语句插件还原
            if (parentPath.isForStatement({ "init": node }) || path.key == "init") {
                console.log("VariableDeclaration-> 在for语句init里面!");
                return;
            }
            //在for语句update里面，由for语句插件还原
            if (parentPath.isForStatement({ "update": node }) || path.key == "update") {
                console.log("SequenceExpression-> 在for语句update里面!");
                return;
            }

            //比如:三目运算符2，3部分, 比如: (a=1,b=2,c==3)? (b=3,c=4,d=5):(b=13,c=14,d=15);
            if (parentPath.isConditionalExpression()) {
                console.log("SequenceExpression-> 在判别式里面! ");
                return;
            }
            //还是三目运算符的2，3部分， (a=1,b=2,c==3)? b=(c=4,d=5,e=6):b=(c=14,d=15,e=16);
            if (parentPath.key == "consequent" || parentPath.key == "alternate") {
                console.log("SequenceExpression-> 在判别式里面2! ");
                return;
            }

            // console.log("\n===|>\r\n", path.toString(), "\r\n<|===\n");

            //i=1开始，保留最后一项，前面的依次弹出            
            let length = node.expressions.length;
            for (let i = 1; i < length; i++) {
                parentPath.insertBefore(types.ExpressionStatement(node.expressions.shift()));
            }

            /* 
            //另一种实现方式
            let {expressions} = node;
            let lastExpression = expressions.pop();
            for(let expression of expressions){
                parentPath.insertBefore(types.ExpressionStatement(expression));
            }
            //将最后一个放在哪里比较好呢
            if(parentPath.isAssignmentExpression()){
                parentPath.node.right = types.ExpressionStatement(lastExpression);
            }else{
                path.node.expressions = [lastExpression];
            } */
        }
    }
};


let ast = parse(code);

// 星球插件
// traverse(ast, standardLoop);
// traverse(ast, SimplifyIfStatement);
// traverse(ast, resolveSequence);

traverse(ast, commaPlugin);
// traverse(ast, resolveSequence2);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n")
console.log(ouput);
console.timeEnd("处理完成，耗时")

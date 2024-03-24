/* 
    插件13

    before：
        【必选】：
            插件：循环、if 加上花括号

        可选：
            插件(plugin_self)：if语句展开
            插件(plugin_self)：for语句展开
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

let jsfile = path.join(__dirname, "14_13_逗号表达式展开_code.js");

const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);



// (星球)逗号表达式(简易版) https://wx.zsxq.com/dweb2/index/topic_detail/418528444114288
const pluginCommaUnfold = {
    SequenceExpression(path) {
        let { scope, parentPath, node } = path;
        let expressions = node.expressions;

        //情况：return语句 => function func(){ return a=1, b=2, c=3;}
        if (parentPath.isReturnStatement({ "argument": node })) {
            //这里只pop()了一次，最后替换
            let lastExpression = expressions.pop();
            for (let expression of expressions) {
                parentPath.insertBefore(types.ExpressionStatement(expression = expression));
            }
            path.replaceInline(lastExpression);
        }

        //情况：常规句子 => a=1,b=2,c=3;
        else if (parentPath.isExpressionStatement({ "expression": node })) {
            let body = [];
            expressions.forEach(express => { body.push(types.ExpressionStatement(express)); });
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
    else if(parentPath.isIfStatement({ "test": node })){
        if(parentPath.key === "alternate"){
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




// 星球插件
// traverse(ast, pluginCommaUnfold); //简易版
traverse(ast, pluginCommaUnfold2); //丰富版



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n")
console.log(ouput);
console.timeEnd("处理完成，耗时")

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


const { isNodeLiteral, isNodePure, color } = require("../../../ast_plugins_star/0_utils");

console.time("处理完成，耗时");


// let jsfile = path.join(__dirname, "t3_code.js");
// let jsfile = path.join(__dirname, "output1_字符串还原.js");
// let jsfile = path.join(__dirname, "output2_常量折叠.js");
// let jsfile = path.join(__dirname, "output3_解密函数还原.js");
// let jsfile = path.join(__dirname, "output4_常量折叠.js");
// let jsfile = path.join(__dirname, "output5_对象属性合并.js");
// let jsfile = path.join(__dirname, "output6_对象被赋值给相邻节点.js");
// let jsfile = path.join(__dirname, "output7_对象属性访问还原.js");
// let jsfile = path.join(__dirname, "output8_加上花括号.js");
let jsfile = path.join(__dirname, "output9_逗号表达式还原.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

/* 【*】第1步：进制字符串还原 */
const pluginStringSimplify = {
    NumericLiteral({ node }) {
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
    StringLiteral({ node }) {
        if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
}
// traverse(ast, pluginStringSimplify);


/* 【*】第2步：常量折叠 */
const pluginConstantFold2 = {
    "Identifier|BinaryExpression|UnaryExpression|MemberExpression": {
        exit(path) {
            if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
                return;
            }
            const { confident, value } = path.evaluate();
            if (!confident)
                return;
            if (typeof value == 'number' && (!Number.isFinite(value))) {
                return;
            }
            if (path.isIdentifier() && typeof value == "object") {
                return;
            }
            console.log(value)
            path.replaceWith(types.valueToNode(value));
        }
    },
}
// traverse(ast, pluginConstantFold2);



/* 【*】第3步：解密函数还原 */
// let envfile = path.join(__dirname, "env2.js");
// let decodeObCode = fs.readFileSync(envfile, { encoding: "utf-8" });
// eval(decodeObCode);
// console.log($b);
const pluginObFunctionRestore = {
    CallExpression(path) {
        let { node, parthPath } = path;
        let { callee, arguments } = node;
        if (!types.isIdentifier(callee) || callee.name != "$b") {
            return;
        }
        if (!isNodeLiteral(arguments)) {
            return;
        }
        let args = arguments.map(x => x.value);
        let retval;
        try {
            retval = $b(...args);
        } catch (error) {
            console.log(">>>>", node.loc.start.line, path.toString());
            throw error;
        }

        if (!['string', 'number', 'boolean'].includes(typeof retval)) { return; }
        console.log(">>>", node.loc.start.line, retval);
        path.replaceWith(types.valueToNode(retval));                      //替换

    }
}
// traverse(ast, pluginObFunctionRestore);


/* 【*】第4步：常量折叠 */
// traverse(ast, pluginConstantFold2);


/* 【*】第5步：对象属性合并 */
const pluginMergeObjProperty = {
    "VariableDeclarator|AssignmentExpression"(path) {
        let { node, parentPath, scope } = path;
        const { id, init, left, right } = node;
        //必须不能为空：如var N;
        if (!init && !right) {
            return;
        }
        //右边必须是{}
        if (init && !types.isObjectExpression(init)) {
            return;
        }
        if (right && !types.isObjectExpression(right)) {
            return;
        }

        let name = id ? id.name : left.name;
        let properties = init ? init.properties : right.properties; //专门用来存放属性及值的列表

        let allNextSiblings = parentPath.getAllNextSiblings();
        for (let nextSibling of allNextSiblings) {
            //退出条件
            if (!nextSibling.isExpressionStatement()) break;

            //N['kchUv'] = b('0', 'kG%a');
            let expression = nextSibling.get('expression'); //取得不带";"的表达式

            //退出条件
            if (!expression.isAssignmentExpression({ operator: "=" })) break;

            let { left, right } = expression.node;
            if (!types.isMemberExpression(left)) break;

            let { object, property } = left;

            /* 
            //原来的
            if (!types.isIdentifier(object, { name: name }) || !types.isStringLiteral(property)) {
               break;
            }
            properties.push(types.ObjectProperty(property, right));
            nextSibling.remove();
             */

            // 扩展：
            // 前面只能处理：    N['AgHaJ'] = b('2', '4fPv');  N['VtmkW'] = b('3', 'N6]X');
            // 未对以下进行兼容： N.VmWw = b('4', 'Nex5');     N.XmMb = b('4', '6[Gx');
            if (types.isIdentifier(object, { name: name }) && types.isStringLiteral(property)) {
                properties.push(types.ObjectProperty(property, right));
            }
            else if (types.isIdentifier(object, { name: name }) && types.isIdentifier(property)) {
                properties.push(types.ObjectProperty(types.stringLiteral(property.name), right));
            } else {
                break;
            }
            nextSibling.remove();
        }
        scope.crawl();
    }
}
// traverse(ast, pluginMergeObjProperty);


/* 【*】第6步：对象被赋值给相邻节点 */
function deassign_object(leftNode, rightNode, nextSibling) {
    let leftName = leftNode.name;
    //a = _0x5f4ce4;
    if (nextSibling.isExpressionStatement()) {
        let { expression } = nextSibling.node;
        if (types.isAssignmentExpression(expression) && types.isIdentifier(expression.right, { "name": leftName })) {
            nextSibling.node.expression.right = rightNode;
        }
    }
    // var b=_0x5f4ce4;
    else if (nextSibling.isVariableDeclaration()) {
        let { declarations } = nextSibling.node;
        if (declarations.length == 1) {
            let first_declaration = declarations[0];
            if (types.isVariableDeclarator(first_declaration) && types.isIdentifier(first_declaration.init, { "name": leftName })) {
                first_declaration.init = rightNode;
            }
        }
    }
}

pliginRenameObj2 = {
    /* 
     _0x5f4ce4 = {
        "arkXl": _0x5a09c0["KKLDa"]
        };
    a = _0x5f4ce4;
    */
    AssignmentExpression(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || !types.isObjectExpression(right) || operator != "=") {
            return;
        }
        let nextSibling = parentPath.getNextSibling();
        deassign_object(left, right, nextSibling);
    },

    /* 
    var _0x5f4ce4 = {
        "arkXl": _0x5a09c0["KKLDa"]
        };
    var b=_0x5f4ce4;
    */
    VariableDeclarator(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isVariableDeclaration()) {
            return;
        }
        let { id, init } = node;
        if (!types.isIdentifier(id) || !types.isObjectExpression(init)) {
            return;
        }
        let nextSibling = parentPath.getNextSibling();
        deassign_object(id, init, nextSibling);
    }
}
//  traverse(ast, pliginRenameObj2);

/* 【*】第7步：对象属性和方法访问还原 */
function savePropertiesToObject(properties, newMap) {
    for (const property of properties) {
        if (!property.key) break;

        let propKey = property.key.value; //获取到属性名
        let propValue = property.value;   //获取到属性值

        //属性值为字面量，则直接保存
        if (types.isStringLiteral(propValue) || types.isNumericLiteral(propValue)) {
            newMap.set(propKey, propValue.value)
        }
        //属性值为函数，且函数只有一个return语句 
        else if (types.isFunctionExpression(propValue)) {
            let body = propValue.body.body;
            if (body.length == 1 && types.isReturnStatement(body[0])) {
                // 获取到return语句后面的值
                let argument = body[0].argument;
                if (types.isCallExpression(argument)) {
                    newMap.set(propKey, "Call");
                }
                else if (types.isBinaryExpression(argument) || types.isLogicalExpression(argument)) {
                    if (types.isIdentifier(argument.left) && types.isIdentifier(argument.right)) {
                        newMap.set(propKey, argument.operator);
                    }
                }
            }
        } else {
            break;
        }
    }
}
// 替换引用到的节点
function replaceReferNode(newMap, referencePaths, scope) {
    for (const referPath of referencePaths) {
        try {
            let { node, parent, parentPath } = referPath;
            console.log("引用", node.loc.start.line);

            let ancestorPath = parentPath.parentPath;
            if (!parentPath.isMemberExpression({ "object": node })) {
                continue;
            }

            let propValue = newMap.get(parent.property.value);
            if (!propValue) {
                continue;
            }

            // 函数调用的情况，使用
            // _0x5a09c0["tHjcn"](1, 2); m = _0x5a09c0["name"].split("|");
            if (ancestorPath.isCallExpression({ "callee": parent })) {
                let { arguments } = ancestorPath.node; //根据祖先节点拿到实参
                switch (propValue) {
                    case "Call":
                        ancestorPath.replaceWith(types.callExpression(arguments[0], arguments.slice(1)));
                        break;
                    case "||":
                    case "&&":
                        ancestorPath.replaceWith(types.logicalExpression(propValue, arguments[0], arguments[1]));
                        break
                    // + - * /
                    default:
                        ancestorPath.replaceWith(types.binaryExpression(propValue, arguments[0], arguments[1]));
                }
            }
            // 属性值为字面量的情况
            else {
                parentPath.replaceWith(types.valueToNode(propValue));
            }
            scope.crawl();
        } catch (error) {
            debugger;
            console.log("错误!", error);
        }

    }
}
const plugintraceAndParseObj = {
    "VariableDeclarator|AssignmentExpression"(path) {
        let { node, scope, parentPath } = path;
        if (path.isVariableDeclarator()) {
            var { id: left, init: right } = node;
            //右边必须是一个对象
            if (!types.isObjectExpression(right)) {
                return;
            }
        } else {
            var { left, operator, right } = node;
            if (!parentPath.isExpressionStatement()) { return; }
            if (!types.isIdentifier(left) || operator != "=" || !types.isObjectExpression(right)) { return; }
        }
        let name = left.name;
        let binding = scope.getBinding(name);
        if (!binding) { return; }
        let { constant, referencePaths, constantViolations } = binding;
        //变量声明语句，则不不能改变
        //变量赋值语句，则本身就是改变了一次
        if (!constant && constantViolations.length != 1) { return; }

        //空对象{}
        let properties = right.properties;
        if (properties.length == 0) { return; };

        let newMap = new Map();
        savePropertiesToObject(properties, newMap);
        if (newMap.size != properties.length) {
            console.log("对象属性不一致!", node.loc.start.line);
            return;
        };


        replaceReferNode(newMap, referencePaths, scope);
        newMap.clear();
    },
}
// traverse(ast, plugintraceAndParseObj);


/* 【*】第8步：加上花括号 */
const standardLoop = {
    //循环语句加上{}
    "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
        if (!types.isBlockStatement(node.body)) {
            node.body = types.BlockStatement([node.body]);
        }
    },

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


/* 【*】第9步：逗号表达式还原 */
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
// traverse(ast, pluginCommaUnfold2);


/* 【*】第10步：控制流还原 */
const pluginContrlFlowRestore = {
    "WhileStatement|ForStatement": function (path) {
        let { node, scope } = path;

        const test = node.test;
        const body = node.body;
        let switchNode = body.body[0];            //取到SwitchStatement
        if (!types.isSwitchStatement(switchNode)) { return; }
        let { discriminant, cases } = switchNode; //获取对应的节点 => s[x++] 和 cases是case组成的列表
        let { object, property } = discriminant;  //获取swith(xxx)中的xxx，这里为：s[x++]。object=>s, property=>x++
        let arrName = object.name;
        let binding = scope.getBinding(arrName);  //根据绑定，获取到代码s="3|1|2".split("|");
        if (!binding) {
            return;
        }
        console.log(">>>>>>>>>>>>", binding.path.toString());


        //下面这一坨其实可以固定写死
        let { init } = binding.path.node;            //取到"3|1|2".split("|")
        let argument;
        if (init) {
            object = init.callee.object.value;      //取到字符串"3|1|2"
            property = init.callee.property.name || init.callee.property.value;   //取到属性"split"
            argument = init.arguments[0].value;     //取到参数"|"    
        }
        //未初始化的情况，直接找上一句
        else {
            let prePath = path.getPrevSibling();
            if (!prePath.isExpressionStatement()) {
                return;
            }
            let right = prePath.node.expression.right;
            object = right.callee.object.value;
            property = right.callee.property.name || right.callee.property.value;
            argument = right.arguments[0].value;
        }

        let arrayFlow = object[property](argument);  //开始计算：结果为[3,1,2]
        // let arrayFlow = [3, 1, 2]; // 针对特定的，固定写死也可以的!

        let resultBody = [];

        //遍历下标列表(该示例是index未变化的情况)
        arrayFlow.forEach(function (index) {
            // //遍历case节点组成的列表，筛选出对应下标的case节点
            // let switchCase = cases.filter(function (c) {
            //     //c是每个case节点! index值可能会被重新赋值，留到下一轮循环中去!(这里没考虑到)
            //     /* 思考，遍历下面的节点? 找到有重新赋值给index的语句？然后继续？ */
            //     return c.test.value == index;
            // })[0]; //.filter方法返回一个列表，所以取下标[0]

            //遍历case节点组成的列表，筛选出对应下标的case节点
            let switchCase = cases.filter(function (c) {
                //c是每个case节点! index值可能会被重新赋值，留到下一轮循环中去!(这里没考虑到)
                /* 思考，遍历下面的节点? 找到有重新赋值给index的语句？然后继续？ */
                return c.test.value == index;
            });

            //.filter方法返回一个列表，所以取下标[0]
            if (switchCase.length > 0) {
                let caseBody = switchCase[0].consequent; //caseBody是一个列表
                //若case语句最后对应的是continue语句，则删除
                if (types.isContinueStatement(caseBody[caseBody.length - 1])) {
                    caseBody.pop();
                };
                resultBody = resultBody.concat(caseBody);
            }

        });
        console.log("控制流:", node.loc.start.line);
        path.replaceWithMultiple(resultBody); //替换整个while和switch组成的控制流语句
        // console.log("<<<", binding.path.parentPath.toString());
        binding.path.remove();                //删除const s="3|1|2".split("|");
    }
}
traverse(ast, pluginContrlFlowRestore);



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);

// let outputfile = path.join(__dirname, "output3_解密函数还原.js");
// let outputfile = path.join(__dirname, "output4_常量折叠.js");
// let outputfile = path.join(__dirname, "output5_对象属性合并.js");
// let outputfile = path.join(__dirname, "output6_对象被赋值给相邻节点.js");
// let outputfile = path.join(__dirname, "output7_对象属性访问还原.js");
// let outputfile = path.join(__dirname, "output8_加上花括号.js");
// let outputfile = path.join(__dirname, "output9_逗号表达式还原.js");
let outputfile = path.join(__dirname, "output10_控制流还原.js");
fs.writeFileSync(outputfile, ouput);
console.timeEnd("处理完成，耗时")


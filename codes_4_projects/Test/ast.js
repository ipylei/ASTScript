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
const { isNodeLiteral } = require("../../ast_plugins_star/0_utils");

console.time("处理完成，耗时");


// let jsfile = path.join(__dirname, "code.js");
let jsfile = path.join(__dirname, "output1_字面量还原.js");
// let jsfile = path.join(__dirname, "output2_纯函数还原.js");
// let jsfile = path.join(__dirname, "output3_常量折叠.js");
// let jsfile = path.join(__dirname, "output4_还原对象引用.js");
// let jsfile = path.join(__dirname, "output5_控制流还原.js");
// let jsfile = path.join(__dirname, "output6_函数表达式变为函数声明.js");
// let jsfile = path.join(__dirname, "output7_对象属性合并.js");
// let jsfile = path.join(__dirname, "output7_2_对象被赋值给其他标识符.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);



// 【*】
const pluginStringSimplify = {
    NumericLiteral(path) {
        let { node } = path;
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
    StringLiteral(path) {
        let { node } = path;
        if (node.extra) {
            // node.extra = undefined;

            // console.log("====", path.toString());
            // delete path.node.extra;
            // path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;
            if (/\\u/gi.test(node.extra.raw)) {
                path.node.extra.raw = `${node.extra.raw[0]}${path.node.extra.rawValue}${node.extra.raw[0]}`;

            }
            else {
                node.extra = undefined;
            }

        }
    },
}
// traverse(ast, pluginStringSimplify);

// 【*】
//丰富版
const pluginConstantFold2 = {
    //"Identifier"可以还原变量定义
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


// 【*】
// 遍历节点，使用enter方法
// traverse(ast, pluginConstantFold2);
const envCode = fs.readFileSync(path.join(__dirname, "env.js"), "utf-8");
eval(envCode);
let allObFuncCode = ""; //需要处理的函数
let targetFuncs = []; //只处理需要处理的函数
const collectObFunc = {
    FunctionDeclaration(path) {
        let { node } = path;
        let { id, params, body } = node;
        // 判断参数个数为5
        if (params.length != 5 || body.body.length != 1) {
            return;
        }
        if (!types.isReturnStatement(body.body[0])) {
            return;
        }

        allObFuncCode += path.toString() + "\n";
        targetFuncs.push(id.name);
        path.remove();
        // console.log("删除不再使用的函数");
    }
}
traverse(ast, collectObFunc);
console.log(targetFuncs.length);
eval(allObFuncCode); //将其他纯函数的定义写入内存
const CallToValue = {
    CallExpression(path) {
        let { node } = path;
        let { callee, arguments } = node;

        if (!types.isIdentifier(callee) || !targetFuncs.includes(callee.name)) {
            return;
        }
        if (!isNodeLiteral(arguments)) {
            return;
        }

        try {

            let value = eval(path.toString());
            // console.log(path.toString(), '---->', value);
            path.replaceWith(types.valueToNode(value));

        } catch (error) {
            console.log(">>>>>>>>>", path.toString());
            console.log("error -> ", error);
        }

    }
}
traverse(ast, CallToValue); 


// 【*】
// traverse(ast, pluginConstantFold2);


// 【*】
// 将对象的 属性=>值 抽取出来
function savePropertiesToObject(properties, newMap) {
    for (const property of properties) {
        if (!property.key) break;

        let propKey = property.key.value; //获取到属性名
        let propValue = property.value;   //获取到属性值
        //属性值为字面量，则直接保存
        // if (types.isStringLiteral(propValue) || types.isNumericLiteral(propValue)) {
        if (types.isLiteral(propValue)) {
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
    // for (const referPath of referencePaths) {
    for (const referPath of referencePaths.reverse()) { //倒序遍历？
        console.log(">>>>", referPath.parentPath.toString());

        //* 
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
            // scope.crawl();
        } catch (error) {
            debugger;
            console.log("错误!", error);
        }
        //*/

    }
}
const plugintraceAndParseObj = {
    "VariableDeclarator|AssignmentExpression"(path) {
        let { node, scope, parentPath } = path;
        //VariableDeclarator
        if (path.isVariableDeclarator()) {
            var { id: left, init: right } = node;
            //右边必须是一个对象
            if (!types.isObjectExpression(right)) {
                return;
            }
        }
        //AssignmentExpression
        else {
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
        //遍历properties，并保存属性对应的值为字面量或者简单函数
        let newMap = new Map();
        savePropertiesToObject(properties, newMap);
        if (newMap.size != properties.length) {
            console.log("对象属性不一致!", node.loc.start.line);
            return;
        };

        console.log("准备还原~~~~");
        replaceReferNode(newMap, referencePaths, scope);
        newMap.clear();
    },
}
// traverse(ast, plugintraceAndParseObj);

// 【*】5
const pluginContrlFlowRestore = {
    "WhileStatement|ForStatement": function (path) {
        let { node, scope } = path;
        const test = node.test;
        const body = node.body;
        let switchNode = body.body[0];            //取到SwitchStatement
        if (!types.isSwitchStatement(switchNode)) { return; }
        let { discriminant, cases } = switchNode; //获取对应的节点 => s[x++] 和 cases是case组成的列表
        if (!types.isMemberExpression(discriminant)) { return; }

        let { object, property } = discriminant;  //获取swith(xxx)中的xxx，这里为：s[x++]。object=>s, property=>x++
        let arrName = object.name;
        let binding = scope.getBinding(arrName);  //根据绑定，获取到代码s="3|1|2".split("|");
        if (!binding) { return; }
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

        //固定写死的情况
        // let arrayFlow = [3, 1, 2]; // 针对特定的，固定写死也可以的!

        let resultBody = [];
        //遍历下标列表(该示例是index未变化的情况)
        arrayFlow.forEach(function (index) {
            //遍历case节点组成的列表，筛选出对应下标的case节点
            let target_list = cases.filter(function (c) { return c.test.value == index; });
            //.filter 方法返回一个列表，所以取下标[0]
            if (target_list.length > 0) {
                let caseBody = target_list[0].consequent;        //caseBody是一个列表
                //若case语句最后对应的是continue语句，则删除
                if (types.isContinueStatement(caseBody[caseBody.length - 1])) {
                    caseBody.pop();
                };
                // resultBody = resultBody.concat(caseBody);
                resultBody.push(...caseBody);
            }
        });

        console.log("控制流:", node.loc.start.line);
        path.replaceWithMultiple(resultBody);                    //替换整个while和switch组成的控制流语句
        // console.log("<<<", binding.path.parentPath.toString());
        binding.path.remove();                                   //删除const s="3|1|2".split("|");
    }
}
// traverse(ast, pluginContrlFlowRestore);

// 【*】6 函数表达式变为函数声明
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

// traverse(ast, pluginVarDeclarToFuncDeclar);


// 【*】7.对象属性合并
const pluginMergeObjProperty = {
    "VariableDeclarator|AssignmentExpression"(path) {
        let { node, parentPath, scope } = path;
        const { id, init, left, right, operator } = node;
        if (operator && operator != "=") {
            return;
        }

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

// 【*】7.2 对象被赋值给其他标识符
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


//  【*】7.3 还原对象
// traverse(ast, plugintraceAndParseObj);


//【*】  删除没有参数，且没有返回值的函数调用、函数声明





//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output1_字面量还原.js");
// let outputfile = path.join(__dirname, "output2_纯函数还原.js");
// let outputfile = path.join(__dirname, "output3_常量折叠.js");
// let outputfile = path.join(__dirname, "output4_还原对象引用.js");
// let outputfile = path.join(__dirname, "output5_控制流还原.js");
// let outputfile = path.join(__dirname, "output6_函数表达式变为函数声明.js");
// let outputfile = path.join(__dirname, "output7_对象属性合并.js");
// let outputfile = path.join(__dirname, "output7_2_对象被赋值给其他标识符.js");
// let outputfile = path.join(__dirname, "output7_3_还原对象引用.js");
// fs.writeFileSync(outputfile, ouput);

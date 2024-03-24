/* 
    插件：无
    缺点：未考虑到其他情况
        1.function(){return a&b&c;}

    before:
        (*)插件：属性访问方式更改
        (*)插件：属性合并


        (*)插件：变量定义分离

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
let { color } = require("../0_utils");


let jsfile = path.join(__dirname, "对象属性和方法引用还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

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

    var referCount = referencePaths.length;
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
            referCount--;

            // scope.crawl();
        } catch (error) {
            debugger;
            console.log("错误!", error);
        }
        //*/

    }

    return referCount == 0;
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

        //这里可以注释，即使没有也可以先还原部分
        if (newMap.size != properties.length) {
            console.log(color.red, node.loc.start.line, "对象属性数量不一致!");
            return;
        };

        var referCount = replaceReferNode(newMap, referencePaths, scope);
        // referCount == 0 && path.remove();
        newMap.clear();


    },
}
traverse(ast, plugintraceAndParseObj);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

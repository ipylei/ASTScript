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


let jsfile = path.join(__dirname, "input_code.js");
// let jsfile = path.join(__dirname, "output1_解密函数还原.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);



let envfile = path.join(__dirname, "env.js");
let decodeObCode = fs.readFileSync(envfile, { encoding: "utf-8" });
eval(decodeObCode);
console.log(_$ob);

/* 【*】第1步：解密函数还原 */
const pluginObFunctionRestore = {
    CallExpression(path) {
        let { node, parthPath } = path;
        let { callee, arguments } = node;
        if (!types.isIdentifier(callee) || callee.name != "_$ob") {
            return;
        }
        if (!isNodeLiteral(arguments)) {
            return;
        }
        let args = arguments.map(x => x.value);
        let retval = _$ob(...args);

        if (!['string', 'number', 'boolean'].includes(typeof retval)) { return; }
        console.log(">>>", node.loc.start.line, retval);
        path.replaceWith(types.valueToNode(retval));                      //替换

    }
}
traverse(ast, pluginObFunctionRestore);


/* 【*】第2步，对象属性和方法访问还原 */
// 将对象的 属性=>值 抽取出来
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


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);

let outputfile = path.join(__dirname, "output1.js");
// let outputfile = path.join(__dirname, "output2_对象属性访问还原.js");
fs.writeFileSync(outputfile, ouput);
console.timeEnd("处理完成，耗时")


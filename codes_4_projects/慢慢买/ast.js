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


// const inputfile = fs.readFileSync(path.join(__dirname, "code.js"), "utf-8");
// const inputfile = fs.readFileSync(path.join(__dirname, "output1_解密函数还原.js"), "utf-8");
// const inputfile = fs.readFileSync(path.join(__dirname, "output2_属性访问方式更改.js"), "utf-8");
const inputfile = fs.readFileSync(path.join(__dirname, "output3_对象属性和方法访问还原.js"), "utf-8");

// const outputfile = path.join(__dirname, "output1_解密函数还原.js");
// const outputfile = path.join(__dirname, "output2_属性访问方式更改.js");
// const outputfile = path.join(__dirname, "output3_对象属性和方法访问还原.js");
const outputfile = path.join(__dirname, "output4_进制字符串还原.js");

let ast = parse(inputfile);

// 【*】 第1步，还原解密函数
/* let decodeObCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });

eval(decodeObCode);

const callToString = {
    CallExpression: {
        exit(path) {
            let { scope, node } = path;
            let { callee, arguments } = node;
            if (!types.isIdentifier(callee) || callee.name != "_0x365d") { return; }
            if (!isNodeLiteral(arguments)) { return; }

            // 使用eval执行函数，得到返回值
            let value = eval(path.toString());

            if (!['string', 'number', 'boolean'].includes(typeof value)) { return; }
            console.log(path.toString(), "-->", value);
            path.replaceWith(types.valueToNode(value));
            // scope.crawl();
        }
    },
}
traverse(ast, callToString);
 */


// 第2步，属性访问方式更改：b.length; --> b["length"]
/* const pluginIdentifierToLiteral = {
    //b.length
    MemberExpression:
    {
        exit(path) {
            let { node } = path;
            const prop = node.property;
            if (!node.computed && types.isIdentifier(prop)) {
                node.property = types.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },

    //给属性加上引号：a={name:"leizi"} ===> a={"name":"leizi"}
    //其实感觉单独提取出去比较合适
    ObjectProperty:
    {
        exit(path) {
            let { node } = path;
            const key = node.key;
            if (!node.computed && types.isIdentifier(key)) {
                node.key = types.StringLiteral(key.name);
                return;
            }
            if (node.computed && types.isStringLiteral(key)) {
                node.computed = false;
            }
        }
    },
}
traverse(ast, pluginIdentifierToLiteral);
*/

//【*】第3步，对象属性和方法访问还原
// 将对象的 属性=>值 抽取出来
/* function savePropertiesToObject(properties, newMap) {
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
traverse(ast, plugintraceAndParseObj);
 */


//【*】第4步，进制字符串还原
const pluginStringSimplify = {
    NumericLiteral(path) {
        let { node } = path;
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
    StringLiteral(path) {
        let { node } = path;
        if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
            // node.extra = undefined;

            // console.log("====", path.toString());
            // delete path.node.extra;
            path.node.extra.raw = `"${path.node.extra.rawValue}"`;
        }
    },
}
traverse(ast, pluginStringSimplify);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")


fs.writeFileSync(outputfile, ouput);

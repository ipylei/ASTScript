const fs = require("fs");
const path = require("path");
// const envirement = require("./environment.js");
// let { _0x4152bb } = envirement;



//解析模块
const parse = require("@babel/parser").parse;
//输出模块
const generate = require("@babel/generator").default;
//遍历模块
const traverse = require("@babel/traverse").default;
//插入模块
const types = require("@babel/types");
const { type } = require("os");
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "code_ob.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);




/* 【*】00:02:00  第1步：16进制转10进制 */
const simplifyLiteral = {
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
traverse(ast, simplifyLiteral);


/* 【*】00:06:49  第2步：常量折叠 */
const constantFold = {
    "BinaryExpression|UnaryExpression|CallExpression|MemberExpression"(path) {
        // 排除一元表达式中诸如 m = -1; m = void 0这种情况;
        if (path.isUnaryExpression({ operator: "-" }) || path.isUnaryExpression({ operator: "void" })) {
            return;
        }
        const { confident, value } = path.evaluate();
        if (!confident)
            return;
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        // console.log("替换成功", path.toString());
        path.replaceWith(types.valueToNode(value));
    },
}
traverse(ast, constantFold);


function isNodeLiteral(node) {
    if (Array.isArray(node)) {
        return node.every(ele => isNodeLiteral(ele));
    }
    if (types.isThisExpression(node)) {
        return true;
    }
    if (types.isLiteral(node)) {
        if (node.value == null) {
            return false;
        }
        return true;
    }
    if (types.isBinaryExpression(node)) {
        return isNodeLiteral(node.left) && isNodeLiteral(node.right);
    }
    if (types.isUnaryExpression(node, { "operator": "-" }) || types.isUnaryExpression(node, { "operator": "+" })) {
        return isNodeLiteral(node.argument);
    }

    if (types.isObjectExpression(node)) {
        let { properties } = node;
        if (properties.length == 0) {
            return true;
        }
        return properties.every(property => isNodeLiteral(property));
    }
    if (types.isArrayExpression(node)) {
        let { elements } = node;
        if (elements.length == 0) {
            return true;
        }
        return elements.every(element => isNodeLiteral(element));
    }

    return false;
}


let decodeObCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
eval(decodeObCode);

/* 【*】00:08:25  第3步：纯函数且实参为字面量的函数还原 

使用：'yRuug': _0x4152bb(1184, 1347, 'iwku', 1341, 1390),
定义：function _0x4152bb(_0xce7aa4, _0x2dd89f, _0x44fb7e, _0x3772ea, _0x68e15e) {
    return _0x4475(_0x68e15e - 626, _0x44fb7e);
  }
*/
/* const CallToValue = {
    CallExpression(path) {
        let { node } = path;
        let { callee, arguments } = node;

        if (!types.isIdentifier(callee, { "name": "_0x4152bb" })) {
            return;
        }
        if (!isNodeLiteral(arguments)) {
            return;
        }

        let value = eval(path.toString());
        console.log(path.toString(), '---->', value);
        path.replaceWith(types.valueToNode(value));
    }
}
traverse(ast, CallToValue);
 */


/* 【*】00:29:30  第4步：还原其他纯函数之抽取函数定义 */
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

        let value = eval(path.toString());
        // console.log(path.toString(), '---->', value);
        path.replaceWith(types.valueToNode(value));
    }
}
traverse(ast, CallToValue);
traverse(ast, constantFold); //再进行一次常量折叠

// 对象合并
const preDecodeObject = {
    VariableDeclarator(path) {
        let { node, parentPath, scope } = path;
        const { id, init } = node;
        //右边必须是{}
        if (!types.isObjectExpression(init)) {
            return;
        }

        let name = id.name;
        let properties = init.properties; //专门用来存放属性及值的列表

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
            // 前面只能处理：N['AgHaJ'] = b('2', '4fPv'); N['VtmkW'] = b('3', 'N6]X');
            // 未对以下进行兼容： N.VmWw = b('4', 'Nex5'); N.XmMb = b('4', '6[Gx');
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
    },

    AssignmentExpression(path) {
        let { node, parentPath, scope } = path;
        const { left, right } = node;
        //右边必须是{}
        if (!types.isObjectExpression(right)) {
            return;
        }

        let name = left.name;
        let properties = right.properties; //专门用来存放属性及值的列表

        let allNextSiblings = parentPath.getAllNextSiblings();
        for (let nextSibling of allNextSiblings) {
            if (!nextSibling.isExpressionStatement()) break;

            //  N['kchUv'] = b('0', 'kG%a');
            let expression = nextSibling.get('expression'); //取得不带";"的表达式
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
            // 前面只能处理：N['AgHaJ'] = b('2', '4fPv'); N['VtmkW'] = b('3', 'N6]X');
            // 未对以下进行兼容： N.VmWw = b('4', 'Nex5'); N.XmMb = b('4', '6[Gx');
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
    },
}
traverse(ast, preDecodeObject);
// (self)变量对象重新赋值
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
const renameObj = {
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
traverse(ast, renameObj);


// 【*】00:42:23  第5步：还原对象引用 (类似于course06>课程内容(下)>第6步)
function savePropertiesToObject(properties, newMap) {
    for (const property of properties) {
        if (!property.key) break;

        let propKey = property.key.value; //获取到属性名
        let propValue = property.value; //获取到属性值
        if (types.isStringLiteral(propValue) || types.isNumericLiteral(propValue)) {
            newMap.set(propKey, propValue.value)
        } else if (types.isFunctionExpression(propValue)) {
            let body = propValue.body.body;
            if (body.length == 1 && types.isReturnStatement(body[0])) {
                // 获取到return语句后面的值
                let argument = body[0].argument;
                if (types.isCallExpression(argument)) {
                    newMap.set(propKey, "Call");
                } else if (types.isBinaryExpression(argument) || types.isLogicalExpression(argument)) {
                    newMap.set(propKey, argument.operator)
                }
            }
        } else {
            break;
        }
    }
}
function replaceReferNode(newMap, referencePaths, scope) {
    for (const referPath of referencePaths) {
        let { node, parent, parentPath } = referPath;
        let ancestorPath = parentPath.parentPath;
        if (!parentPath.isMemberExpression({ "object": node })) {
            continue;
        }

        let propValue = newMap.get(parent.property.value);
        if (!propValue) {
            continue;
        }

        // _0x5a09c0["tHjcn"](1, 2);
        // m = _0x5a09c0["name"].split("|");
        if (ancestorPath.isCallExpression({ "callee": parent })) {
            let { arguments } = ancestorPath.node; //根据祖先节点拿到实参
            switch (propValue) {
                case "Call":
                    ancestorPath.replaceWith(types.callExpression(arguments[0], arguments.slice(1)));
                    break;
                case "||":
                case "&&":
                    ancestorPath.replaceWith(types.logicalExpression(propValue, arguments[0], arguments[1]));
                // + - * /
                default:
                    ancestorPath.replaceWith(types.binaryExpression(propValue, arguments[0], arguments[1]));
            }
        }
        else {
            parentPath.replaceWith(types.valueToNode(propValue));
        }
        scope.crawl();
    }
}
const decodeObject = {
    VariableDeclarator(path) {
        let { node, scope } = path;
        const { id, init } = node;
        // 右边必须是对象：var a = {};
        if (!types.isObjectExpression(init)) return;

        let name = id.name; //对象名称
        let binding = scope.getBinding(name);
        let { constant, referencePaths } = binding;

        console.log("~~~~~~~~~~~~~~~~~~~~");

        //不是常量则不要？
        // if (!constant) {
        //     console.log("被跳过啦");
        //     return;
        // }

        let properties = init.properties;
        if (properties.length == 0) {
            console.log("空对象", path.toString());
            return;
        };

        let newMap = new Map();
        savePropertiesToObject(properties, newMap);
        if (newMap.size != properties.length) {
            console.log("对象属性不一致!", path.toString());
            return
        };
        console.log(newMap);

        try {
            replaceReferNode(newMap, referencePaths, scope);
        } catch (e) {
            console.error("错误!", e);
        }
        newMap.clear();
    }
}
traverse(ast, decodeObject);


// 字符串调用还原
const callToStringLiteral = {
    CallExpression: {
        exit(path) {
            let { callee, arguments } = path.node;
            if (!types.isMemberExpression(callee) || !arguments.every(ele => types.isLiteral(ele))) {
                return;
            }

            let { object, property } = callee;
            let value = undefined;
            if (!types.isStringLiteral(object) || !types.isStringLiteral(property)) {
                return;
            }

            if (arguments.length == 2) {
                value = object.value[property.value](arguments[0].value, arguments[1].value);
            } else if (arguments.length == 1) {
                value = object.value[property.value](arguments[0].value);
            } else if (arguments.length == 0) {
                value = object.value[property.value]();
            } else {
                return;
            }
            path.replaceWith(types.valueToNode(value));
        }
    },
}
traverse(ast, callToStringLiteral);


// 删除不再引用的变量
function isNodePure(node, scope) {
    if (types.isLiteral(node)) {
        return true;
    }

    if (types.isUnaryExpression(node)) {
        return isNodePure(node.argument, scope)
    }

    if (types.isIdentifier(node)) {//处理 var c = String;
        if (scope && scope.isPure(node, true)) {
            return true;
        }

        if (typeof this[node.name] != 'undefined') {
            return true;
        }

        return false;
    }

    if (types.isMemberExpression(node)) {//处理 var d = String.fromCharCode;

        let { object, property, computed } = node;

        if (computed && !isNodePure(property, scope)) {
            return false;
        }
        if (isNodePure(object, scope)) {
            return true;
        }

        if (types.isIdentifier(object)) {

            let name = object.name;

            if (typeof this[name] != 'undefined' && name != 'window') {//注意object为window时，可能会还原出错
                return true;
            }

            return false;
        }
        if (types.isMemberExpression(object)) {
            return isNodePure(object, scope);
        }

        return false;
    }

    if (types.isBinary(node) && scope) {
        return isNodePure(node.left, scope) && isNodePure(node.right, scope);
    }

    return false;
}
const removeDeadCode = {
    "IfStatement|ConditionalExpression"(path) {
        let { consequent, alternate } = path.node;
        let testPath = path.get('test');
        const evaluateTest = testPath.evaluateTruthy();
        if (evaluateTest === true) {
            if (types.isBlockStatement(consequent)) {
                consequent = consequent.body;
            }
            path.replaceWithMultiple(consequent);
            return;
        }
        if (evaluateTest === false) {
            if (alternate != null) {
                if (types.isBlockStatement(alternate)) {
                    alternate = alternate.body;
                }
                path.replaceWithMultiple(alternate);
            }
            else {
                path.remove();
            }
        }
    },
    "LogicalExpression"(path) {
        let { left, operator, right } = path.node;
        let leftPath = path.get('left');
        const evaluateLeft = leftPath.evaluateTruthy();

        if ((operator == "||" && evaluateLeft == true) ||
            (operator == "&&" && evaluateLeft == false)) {
            path.replaceWith(left);
            return;
        }
        if ((operator == "||" && evaluateLeft == false) ||
            (operator == "&&" && evaluateLeft == true)) {
            path.replaceWith(right);
        }
    },
    "EmptyStatement|DebuggerStatement"(path) {
        path.remove();
    },
    "AssignmentExpression"(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement({ "expression": node })) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || operator != "=" || !isNodePure(right, scope)) {
            return;
        }

        let binding = scope.getBinding(left.name);
        if (!binding || binding.referenced) {
            return;
        }

        parentPath.remove();
    },
    "VariableDeclarator"(path) {
        let { node, scope, parentPath } = path;
        if (!parentPath.parentPath.isBlock()) {//过滤for..of等语句
            return;
        }

        let { id, init } = node;
        if (!types.isIdentifier(id) || types.isCallExpression(init) || types.isAssignmentExpression(init)) {//目前只发现赋值语句和调用语句会有问题。后续待添加
            return;
        }
        let binding = scope.getBinding(id.name);//重新解析ast后，一定会有binding;
        let { referenced, constant, constantViolations } = binding;
        if (referenced || constantViolations.length > 1) {
            return;
        }
        if (constant || constantViolations[0] == path) {
            path.remove();
        }
    },

}
// traverse(ast, removeDeadCode);




//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);
console.timeEnd("处理完成，耗时")

let outputfile = path.join(__dirname, "output5_3.js");
fs.writeFileSync(outputfile, ouput);

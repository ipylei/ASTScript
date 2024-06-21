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

let jsfile = path.join(__dirname, "code_5s.js");
const code = fs.readFileSync(jsfile, "utf-8");
console.time("处理完成，耗时");
let ast = parse(code);

// 第一步，还原逗号表达式(该例子只是前面)
const SequenceExpressionVisisor = {
    AssignmentExpression(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }

        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || !types.isSequenceExpression(right) || operator != "=") {
            return;
        }

        let { expressions } = right;
        let lastExpression = expressions.pop();
        for (let expression of expressions) {
            parentPath.insertBefore(types.expressionStatement(expression));
        }
        path.node.right = lastExpression;
    }
};
traverse(ast, SequenceExpressionVisisor);

// 第二步，还原c函数(通用版)
const callToStringCommon = {
    // 1.定位b="xxx".split()， 从而定位前3部分，c函数在第3部分
    AssignmentExpression(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }
        if (!types.isIdentifier(left) || !types.isCallExpression(right) || operator != "=") {
            return;
        }

        if (!path.toString().includes("split")) {
            return;
        }

        let secondPath = parentPath.getNextSibling();
        let thirdPath = secondPath.getNextSibling();
        if (!secondPath.isExpressionStatement() || !thirdPath.isExpressionStatement()) {
            return;
        }

        let decodeCode = parentPath.toString() + secondPath.toString() + thirdPath.toString();
        eval(decodeCode);        //执行c函数所在的代码块，这样内存中就有了c函数
        console.log(c("0x2e3")); //测试c函数调用是否会报错

        //2.根据绑定找到引用c函数的作用域以及所有引用到的path (因为形参也有引用)
        let binding = scope.getBinding(thirdPath.node.expression.left.name);
        if (!binding || binding.constantViolations.length != 1) {
            return;
        }

        for (let referPath of binding.referencePaths) {
            if (!referPath.parentPath.isCallExpression({ "callee": referPath.node })) {
                continue;
            }
            //判断引用的地方是否格式为：c("xxx")
            let { callee, arguments } = referPath.parentPath.node;
            if (!types.isIdentifier(callee) || arguments.length != 1 || !types.isStringLiteral(arguments[0])) {
                continue;
            }

            //3.c函数还原，然后替换
            let value = eval(referPath.parentPath.toString());
            referPath.parentPath.replaceWith(types.valueToNode(value));
        }

        path.stop();

        parentPath.remove();
        secondPath.remove();
        thirdPath.remove();
    }

};
traverse(ast, callToStringCommon);


// 第二步，还原c函数(专用版)
b = "xxxxx很长的一个字符串!!!";
(function (a, c, d) {
    //函数体省略
}(b, 318));
c = function (a, d, e) {
    return a = a - 0, e = b[a], e;
};

const callToStringSpecial = {
    CallExpression(path) {
        let { callee, arguments } = path.node;
        if (!types.isIdentifier(callee, { "name": "c" }) || arguments.length != 1 || !types.isStringLiteral(arguments[0])) {
            return;
        }
        let value = c(arguments[0].value);  //执行c函数
        path.replaceWith(types.valueToNode(value));

    }
}
// traverse(ast, callToStringSpecial);


// 第三步，将其他地方的逗号表达式还原(for, while, return, if)
// 给循环加上括号
const stardardLoop = {
    "ForStatement|WhileStatement": function (path) {
        let { node } = path;
        if (!types.isBlockStatement(node.body)) {
            node.body = types.blockStatement([node.body]);
        }
    }
};
// 给if语句加上括号
const SimplifyIfStatement = {
    "IfStatement": function (path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        const test = path.get("test");
        const evaluateTest = test.evaluateTruthy();
        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(types.blockStatement([consequent.node]));
        }
        if (alternate.node != null && !alternate.isBlockStatement()) {
            alternate.replaceWith(types.blockStatement([alternate.node]));
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
            if (alternate.node == null) {
                path.remove();
            } else {
                path.replaceWithMultiple(alternate.node.body);
            }
        }
    }
};
// 插件：逗号表达式还原
const resolveSequence = {
};
traverse(ast, stardardLoop);
traverse(ast, SimplifyIfStatement);
traverse(ast, resolveSequence);


// 第四步-1，还原属性访问方式，如将"obj.parse"还原为obj["parse"]
const keyToLiteral = {
    MemberExpression:
    {
        exit({ node }) {
            const prop = node.property;
            if (!node.computed && types.isIdentifier(prop)) {
                node.property = types.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },
    ObjectProperty:
    {
        exit({ node }) {
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

// 第四步-2，合并对象
const combinObj = {
    AssignmentExpression(path) {
        let { parentPath, node } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }

        let { left, right, operator } = node;
        if (!types.isIdentifier(left) || !types.isObjectExpression(right) || operator != "=") {
            return;
        }
        let properties = right.properties;
        if (properties.length != 0) {
            return;
        }

        let allNextSiblings = parentPath.getAllNextSiblings();
        for (let nextSibling of allNextSiblings) {
            if (!nextSibling.isExpressionStatement()) {
                break;
            }
            let { expression } = nextSibling.node;
            if (!types.isAssignmentExpression(expression)) {
                break;
            }

            // 合并对象
            let leftNode = expression.left;
            let operator = expression.operator;
            let rightNode = expression.right;
            if (!types.isMemberExpression(leftNode) || !types.isIdentifier(leftNode, { "name": left.name })) {
                break;
            }
            let objNode = types.ObjectProperty(leftNode.property, rightNode);
            properties.push(objNode);
            nextSibling.remove();
        }
    }
}

// 第5步，还原对象赋值： zy={}; az=ay;  ====> 
// ay={}; az={};
const renameObj = {
    AssignmentExpression(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement()) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || !types.isObjectExpression(right) || operator != "=") {
            return;
        }
        let leftName = left.name;

        let nextSibling = parentPath.getNextSibling();
        if (!nextSibling.isExpressionStatement()) {
            return;
        }
        let { expression } = nextSibling.node;
        if (!types.isAssignmentExpression(expression) || !types.isIdentifier(expression.right, { "name": leftName })) {
            return;
        }
        nextSibling.node.expression.right = right;
    }
}

// 第6步 将调用对象的方法处，还原为方法内部语句
// 第7步 还原调用后，利用(星球插件21)删除不再使用的对象
// 第8步 控制流平坦化，与崔庆才流程一致
// traverse(ast, equalPlugin);
    
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

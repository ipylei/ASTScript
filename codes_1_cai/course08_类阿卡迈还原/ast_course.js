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
console.time("处理完成，耗时");


let jsfile = path.join(__dirname, "等号表达式还原_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);



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

/* 
 第4步：还原字面量参数的方法  
*/
let funcList = ['Qu', 'zu', '$u', 'Xu'];
const callToString = {
    //函数调用
    CallExpression: {
        exit(path) {
            let { scope, node } = path;
            let { callee, argument } = node;
            //只对目标方法进行过滤，因为还原其他方法时可能会报错(try-catch捕获的方式不好)
            if (!types.isIdentifier(callee) || !funcList.includes(callee.name)) {
                return;
            }
            if (!isNodeLiteral(argument)) {
                return;
            }

            let value = eval(path.toString());
            //对还原的结果进行过滤，只替换字面量的
            if (!["string", "number", "boolean"].includes(typeof value)) {
                return;
            }
            console.log(path.toString(), '---->', value);
            path.replaceWith(types.valueToNode(value));

        }
    },

    /* 第5步：还原字面量参数的方法-但是套娃 */
    // 赋值语句
    AssignmentExpression: {
        exit(path) {
            let { scope, node, parentPath } = path;
            let { left, operator, right } = node;

            if (!parentPath.isExpressionStatement()) {
                return;
            }

            if (!types.isIdentifier(left) || !types.isLiteral(right) || operator != "=") {
                return;
            }

            let binding = scope.getBinding(left.name);
            if (!binding) {
                return;
            }

            let { constantViolations, referencePaths } = binding;
            if (constantViolations.length == 1 && constantViolations[0] == path) {
                let bindPath = binding.path;
                //找到变量声明的地方
                if (!bindPath.isVariableDeclartor()) {
                    return;
                }

                let { id, init } = bindPath.node;
                if (init != null) {
                    return;
                }
                for (let referPath of referencePaths) {
                    referPath.replaceWith(right);
                }

                parentPath.remove(); //去掉这个节点
                bindPath.remove(); //去掉变量声明语句
                scope.crawl();
            }
        }
    }
}
traverse(ast, callToString);

/* 第6步：在第5步还原后，又出现如第4步中可还原的Function */

/* 
第7步：第6步还原后，又出现可还原的Function如下：
    Qi["xxx"](); => 65535;
*/
const mm = {
    CallExpression: {
        exit(path) {
            let { scope, node } = path;
            let { callee, argument } = node;
            
            if (!types.isMemberExpression(callee)) {
                return;
            }
            //参数数量判断
            if(argument.length != 0){
                return;
            }
            
            //对象和属性判断
            let { object, property } = callee;
            if (!types.isIdentifier(object) || !types.isStringLiteral(property)) {
                return;
            }

            let value = eval(path.toString());
            //对还原的结果进行过滤，只替换字面量的
            if (!["string", "number", "boolean"].includes(typeof value)) {
                return;
            }
            console.log(path.toString(), '---->', value);
            path.replaceWith(types.valueToNode(value));

        }
    },
}

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

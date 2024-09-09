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
//节点构造模块
const template = require("@babel/template").default;

// const { isNodeLiteral, isNodePure, color } = require("../../ast_plugins_star/0_utils");
console.time("处理完成，耗时");


//将源代码解析为AST
let encodeFile = process.argv.length > 2 ? process.argv[2] : path.join(__dirname, "code.js");
let decodeFile = process.argv.length > 3 ? process.argv[3] : path.join(__dirname, "code6.js");
let decodeFileName = decodeFile.split("\\").at(-1);
let step = parseInt(decodeFileName.match(/^\d+/)?.at(0));

const code = fs.readFileSync(encodeFile, "utf-8");
let ast = parse(code);

/* 
1.  if 的 else 如果没有继续承接 if，那else 等于 if 判断右边的值

    举例： if (f < 5) {if(f < 4)...} else {...}

    else 里面没有直接承接  else{if(f.....)}, 所以 else 实际上就是 f -----> case 4


2.  对于  if 里面直接没有承接的情况

    例  if (f < 7) {...} else {...}

    一直找祖宗节点，直到找到 第一次的else 分支的 if，这个 if 判断右边的值 就是 case 的值  实际 f的值
*/

traverse(ast, {
    ForStatement: function (path){
        path.node.body = types.blockStatement([path.node.body])
    }
})


const handleAlternate = {
    IfStatement: {
        exit(path) {
            let { node, scope } = path;
            let { test, consequent, alternate } = node;
            //取出if的值
            let operator = test.operator;
            let name = test.left.name;
            let value = test.right.value;
            if (operator != "<") {
                return;
            }

            if (!alternate || !alternate.body) {
                return;
            }

            //else中不能有if了
            if (types.isIfStatement(alternate.body[0])) {
                return;
            }
            let binding = scope.getBinding(name);
            if (!binding) {
                return
            }

            let forPath = binding.path.parentPath.getNextSibling();
            let newTestNode = types.binaryExpression("===", types.identifier(name), types.valueToNode(value))
            let newIfNode = types.ifStatement(newTestNode, alternate, null);
            forPath.node.body.body.unshift(newIfNode);
            node.alternate = null;
        }
    }

}
traverse(ast, handleAlternate);


const handleConsequent = {
    IfStatement: {
        exit(path) {
            let { node, scope } = path;
            let { test, consequent, alternate } = node;
            //取出if的值
            let operator = test.operator;
            let name = test.left.name;
            let value = test.right.value;
            if(name != "f"){
                return ;
            }


            if (operator != "<") {
                return;
            }

            if (!consequent || !consequent.body) {
                return;
            }

            //if中不能有if了
            if (types.isIfStatement(consequent.body[0])) {
                return;
            }

            if (name == "f" && value == 17) {
                debugger;
            }

            let _value;
            if (value == 1) {
                _value = 0

            } else {
                //一直找祖宗节点，直到找到 第一次的else 分支的 if，这个 if 判断右边的值 就是 case 的值  实际 f的值
                var valuePath = path.findParent(function (_path) {
                    if (!_path.isIfStatement()) {
                        return false;
                    }
                    let { node: _node, scope: _scope } = _path;
                    let { test: _test, consequent: _consequent, alternate: _alternate } = _node;
                    if (!_alternate || !_alternate.body) {
                        return false
                    }

                    if (name != _test.left.name) {
                        return false;
                    }

                    if (_path.get("alternate").isAncestor(path)) {
                        // _value = _test.right.value;
                        console.log("===> name: ", name, "_name: ", _test.left.name, "");

                        return true;
                    }
                    return false;
                });

                if (valuePath) {
                    _value = valuePath.node.test.right.value;
                } else {
                    return;
                }

            }
            if (_value == undefined) {
                return;
            }

            console.log(`${name} < ${value} ------> ${name} === ${_value}`);

            let binding = scope.getBinding(name);
            if (!binding) {
                return
            }
            let forPath = binding.path.parentPath.getNextSibling();
            let newTestNode = types.binaryExpression("===", types.identifier(name), types.valueToNode(_value))
            let newIfNode = types.ifStatement(newTestNode, consequent, null);
            forPath.node.body.body.unshift(newIfNode);

            /* if (alternate && alternate.body){
                console.log("++++++++++++++++++");
                node.consequent = types.blockStatement([]);
            }else{
                path.remove();
            } */
            node.consequent = types.blockStatement([]);
        }
    }
}
traverse(ast, handleConsequent);




// // 第一步 还原简易的 else
// traverse(ast, {
//     IfStatement: {
//        exit: function (path){
//            if(path.get("alternate").node && path.get("alternate.body").length && !path.get("alternate.body.0").isIfStatement()){
//                let name = path.get("test").node.left.name
//                let value = path.get("test").node.right.value
//                // if(i === 9){....}
//                let consequent = path.get("alternate").node
//                let test = types.BinaryExpression("===", types.Identifier(name),  types.valueToNode(value))
//                path.scope.getBinding(name).path.parentPath.container[1].body.body.unshift(types.IfStatement(test, consequent))
//                path.get("alternate").remove()
//            }
//        }
//     }
// })

// // 第二步 还原简易的 if
// traverse(ast, {
//     IfStatement: {
//        exit: function (path){
//             if(path.get("consequent").node && path.get("consequent.body").length && !path.get("consequent.body.0").isIfStatement()){
//                 if (path.get("test.operator").node === "<"){
//                     if(path.get("test.right.value").node === 1){
//                         var value = 0;
//                         var name = path.get("test").node.left.name;
//                     }
//                     else {
//                     //   向上找 在 babel里面 有没有对应的API，我不好说
//                         let _path = path
//                         while (1){
//                         if(_path.parentPath.key === "alternate"){
//                             var name = _path.parentPath.parentPath.get("test").node.left.name
//                             var value = _path.parentPath.parentPath.get("test").node.right.value
//                             break
//                         }
//                             _path = _path.parentPath;
//                         }
//                     }
//                     var test = types.binaryExpression("===", types.Identifier(name), types.valueToNode(value));
//                     var consequent = path.get("consequent").node;
//                     path.scope.getBinding(name).path.parentPath.container[1].body.body.unshift(types.IfStatement(test, consequent))
//                     path.get("consequent").remove()
//                 }
//             }
//        }
//     }
// })



//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast, opts = {
    "compact": false,  // 是否压缩代码
    "comments": false,  // 是否保留注释
    "jsescOption": { "minimal": true },  //Unicode转义
}).code;

// const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")


// console.log("encodeFile ===> ", encodeFile);
// console.log("decodeFile ===> ", decodeFile);
// fs.writeFile(decodeFile, ouput, (err) => { });



/* 
let envCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
let envAst = parse(envCode);  //压缩环境代码
let envCodeCompact = generate(envAst, opts = { "compact": true, }).code;
eval(envCodeCompact);         //运行环境代码

console.log(envCodeCompact);

let envFuncNames = [];        //提取环境代码中的函数名
traverse(envAst, {
    FunctionDeclaration(path) {
        let { parentPath, node } = path;
        if (!parentPath.isProgram()) {
            return; //非全局函数不处理
        }

        let { id, params, body } = node;
        let length = body.body.length;
        //参数为0；函数体为空；函数没有返回值
        if (params.length == 0 || length == 0 || !types.isReturnStatement(body.body[length - 1])){
            return;
        }
        envFuncNames.push(id.name);
    }
})

console.log(envFuncNames);
 */
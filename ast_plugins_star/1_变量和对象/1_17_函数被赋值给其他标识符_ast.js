// https://wx.zsxq.com/dweb2/index/topic_detail/411245288241448
// 参考：E:\Learning相应资料\Learn_Spider相应资料\知识星球\知识星球-蔡老板\函数名还原


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
const { isNodeLiteral, isNodePure, color } = require("../0_utils");

console.time("处理完成，耗时");



let jsfile = path.join(__dirname, "1_17_函数被赋值给其他标识符_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

/*  旧
const collect_deassign_func = {
    // AssignmentExpression(path){
    "AssignmentExpression|VariableDeclarator"(path) {
        let { node, scope } = path;
        var { left, operator, right, id, init } = node;
        left = id || left;
        right = init || right;

        if (operator && operator != "=") { 
            return; 
        }
        //左右两边必须为标识符?
        if (!types.isIdentifier(left) || !types.isIdentifier(right)) { 
            return; 
        }
        //fW=c; fY=c; 
        if (!funcNames.includes(right.name)) { 
            return; 
        }

        //再把左节点加进去
        // funcNames.push(left.name);

        // 进行还原
        let binding = scope.getBinding(left.name);
        if (!binding) { return; }
        let { constantViolations, referencePaths } = binding;
        if (constantViolations.length > 1) { return; }


        //对函数调用进行还原
        for (let referPath of referencePaths) {
            let { parentPath, node } = referPath;
            // 如fW=func; var fW=func; 然后这里将fW也加入进去
            if (parentPath.isAssignmentExpression({ "right": node, "operator": "=" }) || parentPath.isVariableDeclarator({ "init": node, })) {
                //再把左节点加进去
                funcNames.push(left.name);
                continue;
            }

            //必须是方法调用的形式
            if (!parentPath.isCallExpression({ "callee": node })) {
                continue;
            }
            let { arguments } = parentPath.node;

            // if (arguments.length != 1 || !types.isNumberLiteral(arguments[0])) {
            //     continue;
            // }

            //【*】 结果全部用c函数执行
            let value = func1(arguments[0].value);
            console.log(parentPath.toString(), "---->", value);
            parentPath.replaceWith(types.valueToNode(value));
        }
    }
}
 */

//将函数名重新赋值给其他标识符的情况(目前只还原重复赋值的情况，本身函数调用交给专用插件还原!)
//还有个缺点：如果有多个func1在不同作用域，又该怎么还原？
const collect_deassign_func = {
    // AssignmentExpression(path){
    FunctionDeclaration(path) {
        let { node, scope, parentPath } = path;
        let firstName = node.id.name;
        let funcNames = [firstName];
    
        
        const binding = parentPath.scope.getBinding(firstName);
        if (!binding || !binding.constant){
            return;
        }
        if (!binding.referenced) {
            return;
        }



        let sourceCode = path.toString();
        if (sourceCode.includes("try") || sourceCode.includes("random") || sourceCode.includes("Date")) {
            //返回值不唯一不做处理
            return;
        }
        //直接eval，如果缺环境，让其主动报错
        eval(sourceCode);

        parentPath.traverse({
            "AssignmentExpression|VariableDeclarator"(path) {
                let { node, scope } = path;
                var { left, operator, right, id, init } = node;
                left = id || left;
                right = init || right;

                if (operator && operator != "=") {
                    return;
                }
                //左右两边必须为标识符?
                if (!types.isIdentifier(left) || !types.isIdentifier(right)) {
                    return;
                }
                //fW=c; fY=c; 
                if (!funcNames.includes(right.name)) {
                    return;
                }

                //再把左节点加进去
                // funcNames.push(left.name);

                //对左节点进行还原
                let binding = scope.getBinding(left.name);
                if (!binding) { return; }
                let { constantViolations, referencePaths } = binding;
                if (constantViolations.length > 1) { return; }


                //对函数调用进行还原
                for (let referPath of referencePaths) {
                    let { parentPath, node } = referPath;
                    // 如fW=func; var fW=func; 然后这里将fW也加入进去
                    if (parentPath.isAssignmentExpression({ "right": node, "operator": "=" }) || parentPath.isVariableDeclarator({ "init": node, })) {
                        //再把左节点加进去
                        funcNames.push(left.name);
                        continue;
                    }

                    //必须是方法调用的形式
                    if (!parentPath.isCallExpression({ "callee": node })) {
                        continue;
                    }

                    let { arguments } = parentPath.node;
                    //判断实参必须为字面量
                    if (!isNodeLiteral(arguments)) {
                        continue;
                    }

                    //【*】 结果全部用func1函数执行

                    let callString = referPath.parentPath.toString();

                    //替换referPath.parentPath对应的字符串
                    let callStringAfter = callString.replace(referPath.node.name, firstName);
                    let value = eval(callStringAfter);
                    // console.log(callString, "==>", callStringAfter, "==> ", value);

                    //构造字符串
                    /* let call_arguments = arguments.map(x => x.value);
                    let callStringAfter2 = `${firstName}.call(null, ${call_arguments})`;
                    let value = eval(callStringAfter2);
                    console.log(callString, "==>", callStringAfter2, "==> ", value);
                    */

                    if (typeof value == "function" || typeof value == "undefined") { continue; }
                    if (!['string', 'number', 'boolean'].includes(typeof value)) { continue; }
                    console.log(parentPath.toString(), "---->", value);
                    parentPath.replaceWith(types.valueToNode(value));
                }
            }
        })
    },
}
traverse(ast, collect_deassign_func);


const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时");


const fs = require("fs");
const path = require("path");

const { parse } = require("@babel/parser");
const generator = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");


let jsfile = path.join(__dirname, "match2_ob.js");
const code = fs.readFileSync(jsfile, "utf-8");


let AST_parse = parse(code);

// 获取解密函数，并写入内存，后面用到解密函数时直接调用
let member_decode_js = '';
// 前3块对应的代码： 0:大数组;  1:对大数组进行偏移; 2:解密函数(里面使用到了大数组)
for (let i = 0; i <= 2; i++) {
    member_decode_js += generator(AST_parse.program.body[i], { compact: true }).code
    delete AST_parse.program.body[i]
}
//执行前三段代码，这样解密函数就已经在内存中了
eval(member_decode_js);
//测试解密函数是否可以调用
// console.log($b('\x30\x78\x32\x32','\x37\x4a\x56\x24'));



/* 

    接下来对OB混淆第四部分进行脱混淆

*/

// 还原1
traverse(AST_parse, {
    // 解密函数还原：如y[$b("0xd8", "\x30\x78")] ==>  y["tdfg"]
    CallExpression(path) {
        if (path.node.callee.name === '$b' && path.node.arguments[0].type === 'StringLiteral' && path.node.arguments[1].type === 'StringLiteral') {
            //调用解密函数，将得到的值转换为Node
            let $b_call_node = types.valueToNode(eval(path.toString()))
            path.replaceInline($b_call_node);
        }
    },

    //字符串美化，便于观察
    "StringLiteral|NumericLiteral"(path) {
        path.node.extra && delete path.node.extra;
    },

    // 进行字符串合并
    BinaryExpression:
    {
        exit: function (path) {
            if (path.node.left.type === 'StringLiteral' && path.node.right.type === 'StringLiteral') {
                path.replaceInline(types.valueToNode(path.node.left.value + path.node.right.value))
            }
        }
    },
});


// /* start
// 将 y 写入内存对象，后面用到y时直接调用(注意:y在匿名函数中:虽然不影响)
// 注意：y对象的属性值跟原来的不一样：即字符串==>Node节点, function==>Node节点
// 目的：属性值存Node节点的话，后面替换节点就非常方便！ 而不用自己傻瓜式一步步构造节点。
const y = {};
traverse(AST_parse, {
    AssignmentExpression(path) {
        //y对象属性值可能是方法或字符串
        if ((path.node.right.type === 'FunctionExpression' || path.node.right.type === 'StringLiteral')) {
            if (path.node.left.object.name === 'y') {
                //放入右边的节点(方法节点或字符串节点)
                y[path.node.left.property.value] = path.node.right;

                //已经保存到y对象中了，后面都是从y对象中取，AST树中的就可以删除了。 
                //但为了便于分析，建议最后再删除，这样就能看到y或A是否还有地方在引用。
                // delete?
                // path.remove();
            }
        }
    },
});
//测试y对象是否可以使用
// console.log(Object.keys(y));
// console.log(y);
// console.log(generator(AST_parse).code);
//end */

/* start
//使用y对象
console.log(A["tjbsq"]);       //成员表达式在容器里面
A["tjbsq"]();                  //不在容器里面，但可以还原
b["asaf"] = A["tjbsq"];        //不在容器里面，但可以还原
var c = A["tjbsq"];            //不在容器里面，但可以还原
"66" + A["tjbsq"];             //不在容器里面，但可以还原
//end 
*/
// console.log(generator(AST_parse).code);


// 还原2
traverse(AST_parse, {
    //还原A["xxx"]
    MemberExpression(path) {
        //1.还原：y["tjbsq"] = "\u4EBA\u751F\u82E6\u77ED\uFF0C\u4F55\u5FC5python\uFF1F";
        if (path.node.object.name === 'A' && (
            path.inList  //如：console.log(A["pbmUR"])
            || path.parent.type === 'AssignmentExpression'  //如：a0["qKtAN"] = A["pbmUR"];
            || path.parent.type === 'VariableDeclarator'  //如：var a1 = A["gLVag"]
            || path.parent.type === 'BinaryExpression' //如： Y + " | " + A["NJuyy"]
        )) {
            //path.inList代表该path在一个容器里面(比如在参数列表里)
            path.replaceInline(y[path.node.property.value])
        }
    },

    //还原A["xxx"](..args)
    CallExpression(path) {
        if (path.node.callee.object && path.node.callee.object.name === 'A') {
            const y_node = y[path.node.callee.property.value];
            let return_statement_node = y_node.body.body[0];
            if (return_statement_node.type === "ReturnStatement") {
                // 2.还原：y["ogsUo"] = function (Y, Z) {return Y + Z;}; => Y + Z
                if (y_node && return_statement_node.argument.type === 'BinaryExpression') {
                    //取出y对象的值->函数返回值
                    let func_ret1_name = return_statement_node.argument.left.name;
                    let func_ret2_name = return_statement_node.argument.right.name;
                    //取出y对象的值->函数参数
                    let func_param1_name = y_node.params[0].name;
                    let func_param2_name = y_node.params[1].name;
                    //判断形参：参数与返回值是否一致, 以及顺序是否一致
                    if (func_ret1_name === func_param1_name && func_ret2_name == func_param2_name) {
                        // console.log("注意: 参数与返回值一致!!!----", func_param1_name, func_param2_name, func_ret1_name, func_param2_name);

                        //取出y对象的值->函数返回值中的操作符(+ - * /)
                        const operator = return_statement_node.argument.operator;
                        
                        //取出实参：调用方->函数参数(注意：是Node节点)
                        let call_param1_node = path.node.arguments[0];
                        let call_param2_node = path.node.arguments[1];
                        //构造节点，取出"调用方"的左右节点，构造新节点，然后替换到"调用处"
                        path.replaceInline(types.binaryExpression(operator, call_param1_node, call_param2_node));
                    } else {
                        // debugger;
                        console.log("注意: 参数与返回值顺序不一致!!!----", func_param1_name, func_param2_name, func_ret1_name, func_param2_name);
                    }
                }

                //3.还原：y["XXBrm"] = function (Y, Z, a0, a1, a2, a3, a4, a5) {return Y(Z, a0, a1, a2, a3, a4, a5);}; => Y(Z, a0, a1, a2, a3, a4, a5)
                else if (y_node && return_statement_node.argument.type === 'CallExpression') {
                    const arg = path.node.arguments.slice(1);
                    path.replaceInline(types.callExpression(path.node.arguments[0], arg))
                }
            }
        }
    },
});
//*/
// console.log(generator(AST_parse).code);



// 还原3
//* 
traverse(AST_parse, {
    // 字符串还原，比如Unicode编码还原成正常的
    "StringLiteral": function (path) {
        let node = path.node;
        if (node.extra) {
            // if(node.extra && /\\[ux]/gi.test(node.extra.raw)){
            // node.extra.raw = node.extra.rawValue;
            delete path.node.extra;
        }
    }
});
//*/


// 还原4，[]改为.
/* traverse(AST_parse, {
    MemberExpression: {
        exit: function (path) {
            if (path.node.property.type === 'StringLiteral') {
                path.node.computed = false;
                path.node.property.type = 'Identifier';
                path.node.property.name = path.node.property.value;
                delete path.node.property.value;
            }
        }
    },
});
 */

// console.log(generator(AST_parse, { compact: true }).code);
console.log(generator(AST_parse).code);

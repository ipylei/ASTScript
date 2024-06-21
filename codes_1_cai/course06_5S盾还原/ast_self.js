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


// let jsfile = path.join(__dirname, "code_5s.js");
// let jsfile = path.join(__dirname, "output1_逗号表达式展开.js");
// let jsfile = path.join(__dirname, "output2_c函数还原.js");
// let jsfile = path.join(__dirname, "output3_对象属性合并.js");
// let jsfile = path.join(__dirname, "output4_对象重新赋值.js");
// let jsfile = path.join(__dirname, "output5_还原对象的属性和方法访问.js");
// let jsfile = path.join(__dirname, "output6_删除垃圾代码.js");
let jsfile = path.join(__dirname, "output7_加花括号.js");

const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

/* 【*】第1步：逗号表达式展开*/
function SequenceOfStatement(path) {
    let { scope, parentPath, node } = path;
    let ancestorPath = parentPath.parentPath;
    if (ancestorPath.isLabeledStatement()) { //标签节点无法往前插入。
        return;
    }
    let expressions = node.expressions;

    //情况(return语句)：function func(){ return a=1, b=2, c=3;}
    if (parentPath.isReturnStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原return语句中包含的逗号表达式");
    }
    //情况(常规)：a=1,b=2,c=3;
    else if (parentPath.isExpressionStatement({ "expression": node })) {
        parentPath.node.expression = expressions.pop();
        console.log("还原常规语句中包含的逗号表达式");
    }
    //情况(函数调用)：(a = 2, b = 3, c = 4, d = 6, d=7,func)(2,3)
    else if (parentPath.isCallExpression({ "callee": node })) {
        parentPath.node.callee = expressions.pop();
        console.log("还原函数调用中包含的逗号表达式");
    }
    //情况(抛出异常)：throw a = 2, b = 3, c = 4, d = 6, d=7;
    else if (parentPath.isThrowStatement({ "argument": node })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原throw语句中包含的逗号表达式");
    }
    //情况(if)：if(a = 2, b = 3, c = 4, d = 6, d=7){}    
    else if (parentPath.isIfStatement({ "test": node })) {
        if (parentPath.key === "alternate") {
            console.log("排除else if的情况, 建议先使用if语句展开插件");
            return;
        }
        parentPath.node.test = expressions.pop();
        console.log("还原if语句中包含的逗号表达式");
    }
    //情况(while)：while(a = 2, b = 3, c = 4, d = 6, d=7){}    
    else if (parentPath.isWhileStatement({ "test": node })) {
        parentPath.node.test = expressions.pop();
        console.log("还原while语句中包含的逗号表达式");
    }
    //情况(for)：for(a = 2, b = 3, c = 4, d = 6, d=7;;){}
    else if (parentPath.isForStatement({ "init": node })) {
        parentPath.node.init = expressions.pop();
        console.log("还原for语句中包含的逗号表达式");
    }
    //情况(switch)：switch(a = 2, b = 3, c = 4, d = 6, d=7){}
    else if (parentPath.isSwitchStatement({ "discriminant": node })) {
        parentPath.node.discriminant = expressions.pop();
        console.log("还原switch语句中包含的逗号表达式");
    }
    //情况(for ... in)：for(let b1 in a=3,b=4,c=5){}
    else if (parentPath.isForInStatement({ "right": node })) {
        parentPath.node.right = expressions.pop();
        console.log("还原for...in语句中包含的逗号表达式");
    }
    else {
        return;
    }

    //前面是把最后一项保留下来，这里是把其他的都插入到前面去
    for (let expression of expressions) {
        parentPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}

function SequenceOfExpression(path) {
    let { scope, parentPath, node, parent } = path;
    let ancestorPath = parentPath.parentPath;
    let expressions = node.expressions;

    //情况：(a=1,b=2,c=3,d==3)?true:false;
    if (parentPath.isConditionalExpression({ "test": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.test = expressions.pop();
        console.log("还原三目运算符中前面包含的逗号表达式");
    }
    //情况：var ret = (a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isVariableDeclarator({ "init": node }) && ancestorPath.parentPath.isBlock()) {
        parentPath.node.init = expressions.pop();
        console.log("还原(单个)变量声明中包含的逗号表达式");
    }
    //情况：ret = (a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isAssignmentExpression({ "right": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.right = expressions.pop();
        console.log("还原(单个)变量赋值语句中的逗号表达式");
    }
    //情况：!(a = 2, b = 3, c = 4, d = 6, d=7);
    else if (parentPath.isUnaryExpression({ "argument": node }) && ancestorPath.isExpressionStatement({ "expression": parent })) {
        parentPath.node.argument = expressions.pop();
        console.log("还原一元表达式中的逗号表达式");
    } else {
        return;
    }

    //前面是把最后一项保留下来，这里是把其他的都插入到前面去
    for (let expression of expressions) {
        ancestorPath.insertBefore(types.ExpressionStatement(expression = expression));
    }
}

const pluginCommaUnfold2 = {
    SequenceExpression: { //对同一节点遍历多个方法
        exit: [SequenceOfStatement, SequenceOfExpression]
    }
}
// traverse(ast, pluginCommaUnfold2); 


/* 【*】第2步，还原c函数，还原后手动删除 */
let decodeObCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
eval(decodeObCode);

const callToStringSpecial = {
    CallExpression(path) {
        let { callee, arguments } = path.node;
        if (!types.isIdentifier(callee, { "name": "c" }) || arguments.length != 1 || !types.isStringLiteral(arguments[0])) {
            return;
        }
        //使用eval执行函数，得到返回值
        let value = c(arguments[0].value);  //执行c函数
        path.replaceWith(types.valueToNode(value));

    }
}
// traverse(ast, callToStringSpecial);


/* 【*】第3步，将对象属性合并 */
const pluginMergeObjProperty = {
    "VariableDeclarator|AssignmentExpression"(path) {
        let { node, parentPath, scope } = path;
        const { id, init, left, right } = node;
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
    }
}
// traverse(ast, pluginMergeObjProperty);


/* 【*】第4步，还原对象重新赋值，ay={xxx:xxx}, az=zy; */
const pliginRenameObj = {
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
        //后一个节点是赋值语句，且右边的标识符名称与上一句相同
        if (!types.isAssignmentExpression(expression) || !types.isIdentifier(expression.right, { "name": leftName })) {
            return;
        }
        nextSibling.node.expression.right = right;
    }
}
// traverse(ast, pliginRenameObj);


/* 【*】第5步，还原对象的属性和方法访问 */
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
                    break;
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
            if (!parentPath.isExpressionStatement()) {return;}
            if (!types.isIdentifier(left) || operator != "=" || !types.isObjectExpression(right)) {return;}
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
            console.log("对象属性不一致!", name, node.loc.start.line);
            return;
        };

        try {
            replaceReferNode(newMap, referencePaths, scope);
        } catch (e) {
            console.error("错误!", name, node.loc.start.line, e);
        }
        newMap.clear();
    },
}
// traverse(ast, plugintraceAndParseObj);

/* 【*】第6步，删除垃圾代码：删除不再使用的变量、对象 */
const pluginRemoveDeadCode = {
    //if语句、三目运算符
    "IfStatement|ConditionalExpression"(path) {
        let { consequent, alternate } = path.node;
        let testPath = path.get('test');
        const evaluateTest = testPath.evaluateTruthy();
        //直接替换为满足条件
        if (evaluateTest === true) {
            if (types.isBlockStatement(consequent)) {
                consequent = consequent.body;
            }
            path.replaceWithMultiple(consequent);
            return;
        }
        //直接替换为不满足条件的
        if (evaluateTest === false) {
            if (alternate != null) {
                if (types.isBlockStatement(alternate)) {
                    alternate = alternate.body;
                }
                path.replaceWithMultiple(alternate);
            }
            else {
                console.log(node.loc.start.line);
                path.remove();
            }
        }
    },

    //逻辑表达式 a&&b
    "LogicalExpression"(path) {
        let { left, operator, right } = path.node;
        let leftPath = path.get('left');
        const evaluateLeft = leftPath.evaluateTruthy();

        if ((operator == "||" && evaluateLeft == true) || (operator == "&&" && evaluateLeft == false)) {
            path.replaceWith(left);
            return;
        }
        if ((operator == "||" && evaluateLeft == false) || (operator == "&&" && evaluateLeft == true)) {
            path.replaceWith(right);
        }
    },

    //空语句、debugger；
    "EmptyStatement|DebuggerStatement"(path) {
        console.log(path.node.loc.start.line);
        path.remove();
    },

    //变量声明语句
    "VariableDeclarator"(path) {
        let { node, scope, parentPath } = path;
        if (!parentPath.parentPath.isBlock()) {//过滤for..of等在循环内声明的变量语句
            return;
        }

        let { id, init } = node;
        //目前只发现赋值语句和调用语句会有问题。后续待添加
        if (!types.isIdentifier(id) || types.isCallExpression(init) || types.isAssignmentExpression(init)) {
            return;
        }

        //重新解析ast后，一定会有binding;
        let binding = scope.getBinding(id.name);
        let { referenced, constant, constantViolations } = binding;
        if (!referenced) {
            console.log(node.loc.start.line);
            path.remove();
        }
    },


    //赋值语句，有绑定，但引用数为0
    "AssignmentExpression"(path) {
        let { parentPath, node, scope } = path;
        if (!parentPath.isExpressionStatement({ "expression": node })) {
            return;
        }
        let { left, operator, right } = node;
        if (!types.isIdentifier(left) || operator != "=") {
            return;
        }

        let binding = scope.getBinding(left.name);
        if (binding && !binding.referenced) {
            console.log(node.loc.start.line);
            parentPath.remove();
        }
    },

    //函数声明语句
    FunctionDeclaration(path) {
        let { node, parentPath } = path;
        let { id, body } = node;
        const binding = parentPath.scope.getBinding(id.name);
        if (binding && !binding.referenced) {
            console.log(node.loc.start.line);
            path.remove();
        }
    }

}
// traverse(ast, pluginRemoveDeadCode);




/* 【*】第7步，加{} */
//for加上{}
const standardLoop =
{   
    //循环语句加上{}
    "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
        if (!types.isBlockStatement(node.body)) {
            node.body = types.BlockStatement([node.body]);
        }
    },

    IfStatement(path)
    {
    	const consequent = path.get("consequent");
    	const alternate  = path.get("alternate");
        //给if加上{}
    	if (!consequent.isBlockStatement()) 
    	{
    		consequent.replaceWith(types.BlockStatement([consequent.node]));
    	}
        //给else加上{}
    	if (alternate.node !== null && !alternate.isBlockStatement()) {
    		alternate.replaceWith(types.BlockStatement([alternate.node]));
    	}
    },
}
// traverse(ast, standardLoop);
//if加上{}
const SimplifyIfStatement = {
	"IfStatement"(path) {
		const consequent = path.get("consequent");
		const alternate = path.get("alternate");
		const test = path.get("test");
		const evaluateTest = test.evaluateTruthy();

		//给if加上{}
		if (!consequent.isBlockStatement()) {
			consequent.replaceWith(types.BlockStatement([consequent.node]));
		}
		//给else加上{}
		if (alternate.node !== null && !alternate.isBlockStatement()) {
			alternate.replaceWith(types.BlockStatement([alternate.node]));
		}

		//if语句块中为空{}
		if (consequent.node.body.length == 0) {
			//没有else就只相当于一个普通的语句
			if (alternate.node == null) {
				path.replaceWith(test.node);
			}
			//有else的情况
			else {
				//放入到if语句块中
				consequent.replaceWith(alternate.node);
				alternate.remove();
				path.node.alternate = null;

				//将条件置反
				test.replaceWith(types.unaryExpression("!", test.node, true));
			}
		}
		
		//else语句块中为空{}，则直接删除
		if (alternate.isBlockStatement() && alternate.node.body.length == 0) {
			alternate.remove();
			path.node.alternate = null;
		}

		//替换为if语句块
		if (evaluateTest === true) {
			path.replaceWithMultiple(consequent.node.body);
		}

		//替换为else语句块
		else if (evaluateTest === false) {
			alternate.node === null ? path.remove() : path.replaceWithMultiple(alternate.node.body);
		}
	},
}
// traverse(ast, SimplifyIfStatement);


/*【*】第8步，控制流还原 */
//控制流还原
const pluginContrlFlowRestore = {
    "WhileStatement|ForStatement": function (path) {
        let { node, scope } = path;
        console.log("循环:", node.loc.start.line);
        const test = node.test;
        const body = node.body;
        let switchNode = body.body[0];            //取到SwitchStatement
        if (!types.isSwitchStatement(switchNode)) { return; }
        let { discriminant, cases } = switchNode; //获取对应的节点 => s[x++] 和 cases是case组成的列表
        let { object, property } = discriminant;  //获取swith(xxx)中的xxx，这里为：s[x++]。object=>s, property=>x++
        let arrName = object.name;
        let binding = scope.getBinding(arrName);  //根据绑定，获取到代码s="3|1|2".split("|");
        if (!binding) {
            return;
        }

        //下面这一坨其实可以固定写死
        let { init } = binding.path.node;            //取到"3|1|2".split("|")
        let argument;
        if(init){
            object = init.callee.object.value;      //取到字符串"3|1|2"
            property = init.callee.property.name || init.callee.property.value;   //取到属性"split"
            argument = init.arguments[0].value;     //取到参数"|"    
        }
        //未初始化的情况，直接找上一句
        else{
            let prePath = path.getPrevSibling();
            if(!prePath.isExpressionStatement()){
                return;
            }
            let right = prePath.node.expression.right;
            object = right.callee.object.value;  
            property = right.callee.property.name || right.callee.property.value;
            argument = right.arguments[0].value; 
        }

        let arrayFlow = object[property](argument);  //开始计算：结果为[3,1,2]
        // let arrayFlow = [3, 1, 2]; // 针对特定的，固定写死也可以的!

        let resultBody = [];

        //遍历下标列表(该示例是index未变化的情况)
        arrayFlow.forEach(function (index) {
            // //遍历case节点组成的列表，筛选出对应下标的case节点
            // let switchCase = cases.filter(function (c) {
            //     //c是每个case节点! index值可能会被重新赋值，留到下一轮循环中去!(这里没考虑到)
            //     /* 思考，遍历下面的节点? 找到有重新赋值给index的语句？然后继续？ */
            //     return c.test.value == index;
            // })[0]; //.filter方法返回一个列表，所以取下标[0]

            //遍历case节点组成的列表，筛选出对应下标的case节点
            let switchCase = cases.filter(function (c) {
                //c是每个case节点! index值可能会被重新赋值，留到下一轮循环中去!(这里没考虑到)
                /* 思考，遍历下面的节点? 找到有重新赋值给index的语句？然后继续？ */
                return c.test.value == index;
            });

            //.filter方法返回一个列表，所以取下标[0]
            if (switchCase.length > 0) {
                let caseBody = switchCase[0].consequent; //caseBody是一个列表
                //若case语句最后对应的是continue语句，则删除
                if (types.isContinueStatement(caseBody[caseBody.length - 1])) {
                    caseBody.pop();
                };
                resultBody = resultBody.concat(caseBody);
            }

        });
        console.log("控制流:", node.loc.start.line);
        path.replaceWithMultiple(resultBody); //替换整个while和switch组成的控制流语句
        // console.log("<<<", binding.path.parentPath.toString());
        binding.path.remove();                //删除const s="3|1|2".split("|");
    }
}
traverse(ast, pluginContrlFlowRestore);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);

let outputfile = path.join(__dirname, "output8_控制流还原.js");
fs.writeFileSync(outputfile, ouput);
console.timeEnd("处理完成，耗时")

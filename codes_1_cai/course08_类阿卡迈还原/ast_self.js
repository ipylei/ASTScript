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


// let jsfile = path.join(__dirname, "code_某海外视频网站混淆.js");
// let jsfile = path.join(__dirname, "output1_变量定义分离.js");
let jsfile = path.join(__dirname, "output2_常量折叠.js");
// let jsfile = path.join(__dirname, "output3_变量定义还原.js");
// let jsfile = path.join(__dirname, "output4_逗号表达式还原.js");
// let jsfile = path.join(__dirname, "output5_函数调用还原3.js");


const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);


/* 【*】第1步，变量定义分离 */
const pluginDeclaratorSeparate =
{
   VariableDeclaration(path) {
      let { parentPath, node } = path;
      if (!parentPath.isBlock()) {
         return;
      }

      let { declarations, kind } = node;
      if (declarations.length == 1) {
         return;
      }

      let newNodes = [];
      for (const varNode of declarations) {
         let newDeclartionNode = types.VariableDeclaration(kind, [varNode]);
         newNodes.push(newDeclartionNode);
      }
      path.replaceWithMultiple(newNodes);
      console.log("===>", node.loc.start.line);
   },
}
// traverse(ast, pluginDeclaratorSeparate);


/* 【*】第2步，常量折叠 */
const pluginConstantFold = {
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
      path.replaceWith(types.valueToNode(value));
      ;
   },
}
// traverse(ast, pluginConstantFold);


/* 【*】第3步，变量定义还原 */
const pluginVarDeclaratorRestore = {
   VariableDeclarator(path) {
      let scope = path.scope;
      let { id, init } = path.node;
      if (!init) {
         return;
      }
      if(id.name == "i"){
         debugger;
      }
      //var a=x; 左边a必须为标识符，右边必须是纯节点
      if (!types.isIdentifier(id)) { return; }
      // let is_literal = isNodeLiteral(init);
      let is_pure = isNodePure(init, scope);
      if (!is_pure) {
         return;
      }
      const binding = scope.getBinding(id.name);
      //变量的定义一定会有binding.
      let { constant, referencePaths, constantViolations } = binding;
      if (constantViolations.length > 1) { return; }
      //如果没改变过
      //或者只改变了一次(而且是当次，即声明+初始化，如var a=100)
      if (constant || constantViolations[0] == path) {
         for (let referPath of referencePaths) {
            console.log(referPath.toString(), '<--->', generate(init).code);
            referPath.replaceWith(init);
         }
         path.remove(); //没有被引用，或者替换完成，可直接删除
      }
   },
}
traverse(ast, pluginVarDeclaratorRestore);

let astGlb = typeof window != 'undefined' ? window : global;
const restoreVarDeclarator = {

   VariableDeclarator(path) {
      let { node, scope } = path;
      let { id, init } = node;
      if (!types.isIdentifier(id) || init == null) {
         return;
      }
      let initPath = path.get("init");
      if (initPath.isUnaryExpression({ operator: "+" }) ||
         initPath.isUnaryExpression({ operator: "-" })) {// -5或者 +"3" 也可以算作是字面量
         if (!types.isLiteral(init.argument)) {
            return;
         }
      }

      else if (initPath.isIdentifier()) {//全局属性可以还原。
         if (typeof astGlb[init.name] == 'undefined') {
            return;
         }
      }
      else if (initPath.isMemberExpression()) {
         let name = init.object.name;
         if (typeof astGlb[name] == 'undefined' || name == 'window') {//注意object为window时，可能会还原出错
            return;
         }
      }

      else if (!initPath.isLiteral()) {
         return;
      }

      const binding = scope.getBinding(id.name);

      if (!binding || !binding.constant) return;


      for (let referPath of binding.referencePaths) {
         referPath.replaceWith(init);
      }

      path.remove();

   },
}
// traverse(ast, restoreVarDeclarator);


/* 【*】第4步，逗号表达式还原 */
const standardLoop =
{
   //循环语句加上{}
   "ForStatement|WhileStatement|ForInStatement|ForOfStatement"({ node }) {
      if (!types.isBlockStatement(node.body)) {
         node.body = types.BlockStatement([node.body]);
      }
   },

   IfStatement(path) {
      const consequent = path.get("consequent");
      const alternate = path.get("alternate");
      //给if加上{}
      if (!consequent.isBlockStatement()) {
         consequent.replaceWith(types.BlockStatement([consequent.node]));
      }
      //给else加上{}
      if (alternate.node !== null && !alternate.isBlockStatement()) {
         alternate.replaceWith(types.BlockStatement([alternate.node]));
      }
   },
}
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
// traverse(ast, standardLoop);
// traverse(ast, SimplifyIfStatement);
// traverse(ast, pluginCommaUnfold2);

/* 【*】第5步，函数调用还原 */
let decodeObCode = fs.readFileSync(path.join(__dirname, "env.js"), { encoding: "utf-8" });
eval(decodeObCode);

let funcLists = ['zu', 'Qu', '$u', 'Xu'];
funcLists.push(...["Lh", "Hh", "Yh", "xh", "Fn", "rn", "Rn", "On", "lh", "Uh", "TN", "vh", "Jh", "l8", "II", "b8", "HI", "mI", "B8", "fI", "KI", "FI", "Z", "WI", "ch", "kh", "DI", "h8", "sI", "pI", "RI", "q8", "N8", "T8", "Y8", "U8", "K", "E", "YI", "qI", "O", "xI", "m", "v", "B", "X", "XI", "m8", "PI", "R8", "f8", "zI", "vI", "r", "s8", "I8", "J8", "VI", "dI", "F", "EI", "K8", "Z8", "J", "R", "cI", "p", "t8", "MI", "x8", "M", "rI", "GI", "TI", "E8", "X8", "tI", "D8", "V8", "jI", "SI", "P8", "r8", "z", "bh", "BI", "n8", "A8", "C8", "fh", "Zh", "Bh", "dh", "jn", "Un", "bn", "Ah", "sh", "TQ", "Vh", "Y", "DN", "YW", "Qn", "UW", "BW", "Gn", "tW", "nN", "LN", "Dh", "wW", "VN", "vN", "dW", "RW", "sN", "Ln", "lN", "tN", "MN", "Vn", "nW", "WW", "bW", "rW", "GW", "ZW", "Eh", "jh", "Oh", "hW", "AN", "EN", "qW", "Zn", "rN", "QN", "MW", "SW", "JN", "HN", "Sn", "cW", "CW", "LW", "hN", "vn", "Nn", "Rh", "sW", "pW", "Fh", "Tn", "OW", "pN", "AW", "SN", "lW", "kW", "mn", "wn", "IN", "ln", "bN", "NN", "vW", "gN", "fn", "QW", "DW", "fN", "YN", "Hn", "TW", "ZN", "th", "rh", "xW", "jW", "XW", "zh", "Yn", "GN", "gW", "UN", "xn", "HW", "EW", "XN", "zW", "fW", "PW", "FW", "KN", "CN", "Pn", "gh", "Kh", "BN", "WN", "JW", "qN", "dN", "IW", "zN", "VW", "mW", "KW", "sn", "NW", "jN", "dn", "cn", "SQ", "NI", "Q8", "T", "U", "AI", "UI", "lI", "f", "M8", "OI", "bI", "S8", "p8", "hI", "ZI", "w8", "In", "Qh", "kN", "pn", "kI", "LI", "QI", "CI", "v8", "Ch", "O8", "mQ", "Dn", "Xh", "Nh", "kn", "Wh", "Xn", "H8", "g8", "P", "l", "G8", "gI", "wI", "hn", "HQ", "nn", "AQ", "GQ", "qh", "Th", "WQ", "wN", "IQ", "PN", "ph", "Cn", "Kn", "xN", "cQ", "YQ", "hQ", "FN", "tn", "PQ", "hh", "Mn", "L", "ON", "L8", "W8", "C", "d8", "D", "nI", "JI", "k8", "g", "RN", "An", "nQ", "c8", "Gh", "H", "QQ", "Bn", "Ih", "Wn", "mh", "qn", "Jn", "En", "nh", "xQ", "VQ", "sQ", "wh", "cN", "wQ", "LQ", "gn", "Sh", "zn", "F8", "mN", "Ph", "NQ", "vQ", "Mh", "z8", "j8"]);
const callToString = {
   CallExpression: {
      exit(path) {
         let { scope, node } = path;
         let { callee, arguments } = node;
         if (!types.isIdentifier(callee) || !funcLists.includes(callee.name)) { return; }
         if (!isNodeLiteral(arguments)) { return; }

         // 使用eval执行函数，得到返回值
         let value = eval(path.toString());
         if (!['string', 'number', 'boolean'].includes(typeof value)) { return; }
         console.log(path.toString(), "-->", value);
         path.replaceWith(types.valueToNode(value));
         scope.crawl();
      }
   },

   //插件：变量引用还原
   // 为了避免套娃，所以将赋值语句和调用表达式写在一起
   AssignmentExpression: {
      exit(path) {
         let { scope, node, parentPath } = path;
         let { left, operator, right } = node;
         if (!types.isIdentifier(left) || operator != "=") { return; }

         // let is_literal = isNodeLiteral(right);
         let is_pure = isNodePure(right, scope);
         if (!is_pure) { return; }
         let binding = scope.getBinding(left.name);
         //如果没有binding,或者赋值语句本身改变了它，因此这里判断只有一处改变。
         if (!binding || binding.constantViolations.length > 1) {
            console.log("===============");
            return;
         }
         for (let referPath of binding.referencePaths) {
            console.log(referPath.toString(), '<--->', generate(right).code);
            referPath.replaceWith(right);
         }
         if (parentPath.isExpressionStatement() || parentPath.isSequenceExpression()) {
            path.remove();
         }
      }
   },
   //*/
}
// traverse(ast, callToString);


//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
// console.log(ouput);


let outputfile = path.join(__dirname, "env6.js");
fs.writeFileSync(outputfile, ouput);
console.timeEnd("处理完成，耗时")

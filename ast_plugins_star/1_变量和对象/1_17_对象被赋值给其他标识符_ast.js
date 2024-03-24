/* 
    插件：无
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


let jsfile = path.join(__dirname, "1_17_对象被赋值给其他标识符_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

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

pliginRenameObj2 = {
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
traverse(ast, pliginRenameObj2);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时");


// let outputfile = path.join(__dirname, "output.js");
// fs.writeFileSync(outputfile, ouput);

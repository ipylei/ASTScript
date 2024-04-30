/* 
    插件11：https://wx.zsxq.com/dweb2/index/topic_detail/818848144152482
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


let jsfile = path.join(__dirname, "11_变量定义分离_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

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

   },


   AssignmentExpression: {
      exit(path) {
         let { parentPath, node } = path;
         let { left, operator, right } = node;
         // init时： var a=b=c;
         // 这里还可以排除分号";"，即单个的情况a8=a9;
         if (!parentPath.isVariableDeclarator({ "init": node })
            // && !parentPath.isAssignmentExpression({ "right": node })   //right时：a=b=c=d;  
         ) {
            return;
         }

         // 操作符必须是=，左节点须是标识符，右节点可以不用是标识符
         // if (!types.isIdentifier(left) || !types.isIdentifier(right) || operator != "=") {
         if (!types.isIdentifier(left) || operator != "=") {
            return;
         }

         //找祖先节点，即找到带分号的截止。 目的是为了在前面插入新的语句。
         let ancestorPath = path.findParent(function (path) {
            let val = path.isVariableDeclaration();
            return val;
         });
         if (!ancestorPath) {
            return;
         }

         // 在祖先节点前面插入
         // 诸如var b1 = b2 = b3 = b4;的情况
         //ancestorPath.node.kind => 添加上对应的var、let、const
         ancestorPath.insertBefore(types.VariableDeclaration(ancestorPath.node.kind, [types.VariableDeclarator(left, right)]));
         path.replaceWith(left);

      }
   }
}
traverse(ast, pluginDeclaratorSeparate);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

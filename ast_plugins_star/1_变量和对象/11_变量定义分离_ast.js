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
}
traverse(ast, pluginDeclaratorSeparate);

//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

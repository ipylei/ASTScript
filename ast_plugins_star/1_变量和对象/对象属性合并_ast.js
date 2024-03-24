/* 
    插件 29：https://wx.zsxq.com/dweb2/index/topic_detail/414854425522418

      before：
         插件：4_属性访问方式更改_ast.js
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


let jsfile = path.join(__dirname, "对象属性合并_code.js");
const code = fs.readFileSync(jsfile, "utf-8");
let ast = parse(code);

const pluginMergeObjProperty = {
   "VariableDeclarator|AssignmentExpression"(path) {
      let { node, parentPath, scope } = path;
      const { id, init, left, right, operator } = node;
      //如果有操作符则必须为"=", 而不是a+=2;
      if (operator && operator != "=") { return; }

      //必须不能为空：如var N;
      if (!init && !right) { return; }
      //右边必须是{}
      if (init && !types.isObjectExpression(init)) { return; }
      if (right && !types.isObjectExpression(right)) { return; }

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
         // 原来只能处理：    N['AgHaJ'] = b('2', '4fPv');  N['VtmkW'] = b('3', 'N6]X');
         // 未对以下进行兼容： N.VmWw = b('4', 'Nex5');     N.XmMb = b('4', '6[Gx');
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

traverse(ast, pluginMergeObjProperty);
//将AST还原成JavaScript代码
// const { code: ouput } = generate(ast, { minified: true });
const ouput = generate(ast).code;
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n\n\n");
console.log(ouput);
console.timeEnd("处理完成，耗时")

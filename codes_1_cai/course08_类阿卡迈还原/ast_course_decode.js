const fs = require('fs');
const parser    = require("@babel/parser");
const traverse  = require("@babel/traverse").default;
const types     = require("@babel/types");
const generator = require("@babel/generator").default;

//将源代码解析为AST
process.argv.length > 2 ? encodeFile = process.argv[2]: encodeFile ="./encode.js";
process.argv.length > 3 ? decodeFile = process.argv[3]: decodeFile ="./decode_result.js";


let sourceCode = fs.readFileSync(encodeFile, {encoding: "utf-8"});
let ast    = parser.parse(sourceCode);



console.time("处理完毕，耗时");



const DeclaratorToDeclaration = 
{
   VariableDeclaration(path)
   {
      let {parentPath,node} = path;
   	  if (!parentPath.isBlock())
   	  {
   	 	 return;
   	  }
      let {declarations,kind} = node;
     
      if (declarations.length == 1)
      {
         return;
      }

      let newNodes = [];

      for (const varNode of declarations)
      {
         let newDeclartionNode = types.VariableDeclaration(kind,[varNode]);
         newNodes.push(newDeclartionNode);
      }

      path.replaceWithMultiple(newNodes);

   },
}

traverse(ast, DeclaratorToDeclaration);


const constantFold = {
    "BinaryExpression|UnaryExpression"(path) {
        if(path.isUnaryExpression({operator:"-"}) || 
    	   path.isUnaryExpression({operator:"void"}))
    	{
    		return;
    	}
        const {confident, value} = path.evaluate();
        if (!confident)
            return;
        if (typeof value == 'number' && (!Number.isFinite(value))) {
            return;
        }
        path.replaceWith(types.valueToNode(value));
    },
}

traverse(ast, constantFold);

let astGlb = typeof window != 'undefined'? window : global;

const restoreVarDeclarator = {
	
	VariableDeclarator(path)
	{
		let {node,scope} = path;
		let {id,init} = node;
		if (!types.isIdentifier(id) || init == null) 
		{
			return;
		}
		let initPath = path.get("init");
		if (initPath.isUnaryExpression({operator:"+"}) ||
		    initPath.isUnaryExpression({operator:"-"}))
		{// -5或者 +"3" 也可以算作是字面量
			if (!types.isLiteral(init.argument)) 
			{
				return;
			}
		}
		
		else if (initPath.isIdentifier())
		{//全局属性可以还原。
			if (typeof astGlb[init.name] == 'undefined')
			{
				return;
			}
		}
		else if (initPath.isMemberExpression())
		{
			let name = init.object.name;
			if (typeof astGlb[name] == 'undefined' || name == 'window')
			{//注意object为window时，可能会还原出错
				return;
			}
		}
		
		else if (!initPath.isLiteral())
		{
			return;
		}
		
		const binding = scope.getBinding(id.name);
		
		if (!binding || !binding.constant) return;
		

		for (let referPath of binding.referencePaths)
		{
			referPath.replaceWith(init);
		}
		
		path.remove();
		
	},
}

traverse(ast, restoreVarDeclarator);



const resolveSequence = 
{
	SequenceExpression(path)
	{
		let {scope,parentPath,node} = path;
		let expressions = node.expressions;
		if (parentPath.isReturnStatement({"argument":node}))
		{
			let lastExpression = expressions.pop();
			for (let expression of expressions)
			{
				parentPath.insertBefore(types.ExpressionStatement(expression=expression));
			}
			
			path.replaceInline(lastExpression);
		}
		else if (parentPath.isExpressionStatement({"expression":node}))
		{
			let body = [];
			expressions.forEach(express=>{body.push(types.ExpressionStatement(express));});
            path.replaceWithMultiple(body);
		}
		else
		{
			return;
		}
		
		scope.crawl();
	}
}

traverse(ast, resolveSequence);



ast    = parser.parse(generator(ast).code);



let decodeObCode = fs.readFileSync("change.js", {encoding: "utf-8"});

eval(decodeObCode);


function isNodeLiteral(node) {
    if(Array.isArray(node))
	{
		return node.every(ele=>isNodeLiteral(ele));
	}
    if (types.isLiteral(node)) {
        return true;
    }
    if (types.isUnaryExpression(node, {
        "operator": "-"
    }) || types.isUnaryExpression(node, {
        "operator": "+"
    })) {
        return isNodeLiteral(node.argument);
    }

    if (types.isObjectExpression(node)) {
        let {properties} = node;
        if (properties.length == 0) {
            return true;
        }

        return properties.every(property=>isNodeLiteral(property));

    }
    if (types.isArrayExpression(node)) {
        let {elements} = node;
        if (elements.length == 0) {
            return true;
        }
        return elements.every(element=>isNodeLiteral(element));
    }

    return false;
}


let funcLists = ['Qu','zu','$u','Xu'];
funcLists.push(...["Lh", "Hh", "Yh", "xh", "Fn", "rn", "Rn", "On", "lh", "Uh", "TN", "vh", "Jh", "l8", "II", "b8", "HI", "mI", "B8", "fI", "KI", "FI", "Z", "WI", "ch", "kh", "DI", "h8", "sI", "pI", "RI", "q8", "N8", "T8", "Y8", "U8", "K", "E", "YI", "qI", "O", "xI", "m", "v", "B", "X", "XI", "m8", "PI", "R8", "f8", "zI", "vI", "r", "s8", "I8", "J8", "VI", "dI", "F", "EI", "K8", "Z8", "J", "R", "cI", "p", "t8", "MI", "x8", "M", "rI", "GI", "TI", "E8", "X8", "tI", "D8", "V8", "jI", "SI", "P8", "r8", "z", "bh", "BI", "n8", "A8", "C8", "fh", "Zh", "Bh", "dh", "jn", "Un", "bn", "Ah", "sh", "TQ", "Vh", "Y", "DN", "YW", "Qn", "UW", "BW", "Gn", "tW", "nN", "LN", "Dh", "wW", "VN", "vN", "dW", "RW", "sN", "Ln", "lN", "tN", "MN", "Vn", "nW", "WW", "bW", "rW", "GW", "ZW", "Eh", "jh", "Oh", "hW", "AN", "EN", "qW", "Zn", "rN", "QN", "MW", "SW", "JN", "HN", "Sn", "cW", "CW", "LW", "hN", "vn", "Nn", "Rh", "sW", "pW", "Fh", "Tn", "OW", "pN", "AW", "SN", "lW", "kW", "mn", "wn", "IN", "ln", "bN", "NN", "vW", "gN", "fn", "QW", "DW", "fN", "YN", "Hn", "TW", "ZN", "th", "rh", "xW", "jW", "XW", "zh", "Yn", "GN", "gW", "UN", "xn", "HW", "EW", "XN", "zW", "fW", "PW", "FW", "KN", "CN", "Pn", "gh", "Kh", "BN", "WN", "JW", "qN", "dN", "IW", "zN", "VW", "mW", "KW", "sn", "NW", "jN", "dn", "cn", "SQ", "NI", "Q8", "T", "U", "AI", "UI", "lI", "f", "M8", "OI", "bI", "S8", "p8", "hI", "ZI", "w8", "In", "Qh", "kN", "pn", "kI", "LI", "QI", "CI", "v8", "Ch", "O8", "mQ", "Dn", "Xh", "Nh", "kn", "Wh", "Xn", "H8", "g8", "P", "l", "G8", "gI", "wI", "hn", "HQ", "nn", "AQ", "GQ", "qh", "Th", "WQ", "wN", "IQ", "PN", "ph", "Cn", "Kn", "xN", "cQ", "YQ", "hQ", "FN", "tn", "PQ", "hh", "Mn", "L", "ON", "L8", "W8", "C", "d8", "D", "nI", "JI", "k8", "g", "RN", "An", "nQ", "c8", "Gh", "H", "QQ", "Bn", "Ih", "Wn", "mh", "qn", "Jn", "En", "nh", "xQ", "VQ", "sQ", "wh", "cN", "wQ", "LQ", "gn", "Sh", "zn", "F8", "mN", "Ph", "NQ", "vQ", "Mh", "z8", "j8"]);


const callToString = 
{
	CallExpression:{
		exit(path)
		{
			let {scope,node} = path;
			let {callee,arguments} = node;
			
			if (!types.isIdentifier(callee) || !funcLists.includes(callee.name))
			{
				return;
			}
			
			if (!isNodeLiteral(arguments))
			{
				return;
			}
			
			let value = eval(path.toString());
			
			if (!['string','number','boolean'].includes(typeof value))
			{
				return;
			}
			
			console.log(path.toString(),"-->",value);
			
			path.replaceWith(types.valueToNode(value));
			
			scope.crawl();
			
		}
	},
	AssignmentExpression:{
	exit(path)
	{
		let {scope,node,parentPath} = path;
		let {left,operator,right} = node;
		
		if (!parentPath.isExpressionStatement())
		{
			return;
		}

		if (!types.isIdentifier(left) || !types.isLiteral(right) || operator != "=")
		{
			return;
		}
		
		let binding =  scope.getBinding(left.name);
		 
		if (!binding) return;

		let {constantViolations,referencePaths} = binding;
	
		
		if (constantViolations.length == 1 && constantViolations[0] == path)
		{
			
			let bindPath = binding.path;
			if (!bindPath.isVariableDeclarator())
			{
				return;
			}
			
			let {id,init} = bindPath.node;
			if (init != null)
			{
				return;
			}
			
			for (let referPath of referencePaths)
			{
				referPath.replaceWith(right);
			}
			
			parentPath.remove();
			bindPath.remove();
			scope.crawl();
		}
	}
		
		
	},
}


traverse(ast, callToString);


const calcCallValue = 
{
	CallExpression(path)
	{
		let {scope,node} = path;
		let {callee,arguments} = node;
			
			if (!types.isMemberExpression(callee))
			{
				return;
			}
			
			let {object,property} = callee;
			
			if (!types.isIdentifier(object,{"name":"Qi"}) || !types.isStringLiteral(property))
			{
				return;
			}
			
			if (arguments.length != 0)
			{
				return;
			}
			
			let value = eval(path.toString());
			
			if (!['string','number','boolean'].includes(typeof value))
			{
				return;
			}
			
			console.log(path.toString(),"-->",value);
			
			path.replaceWith(types.valueToNode(value));
			
			scope.crawl();
	}
}


traverse(ast, calcCallValue);

traverse(ast, callToString);


console.timeEnd("处理完毕，耗时");


let {code} = generator(ast,opts = {jsescOption:{"minimal":true}});

fs.writeFile(decodeFile, code, (err) => {});
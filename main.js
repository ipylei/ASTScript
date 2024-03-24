
const parser  = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types   = require("@babel/types");
const generator = require("@babel/generator").default;

let astGlb = null;

if (typeof window !== 'undefined') {
    astGlb = window;
} 
else if (typeof global !== 'undefined') {
  astGlb = global;
} 
else 
{
  astGlb = this;
}


astGlb.parser   = parser ;
astGlb.traverse  = traverse ;
astGlb.types   = types ;
astGlb.generator = generator;
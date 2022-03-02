import parser from '@babel/parser'
import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import path from 'path';
import { Msg, strfy } from './utils.js';
const msg = Msg('PARSER');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let parseOptions = {
  // parse in strict mode and allow module declarations
  sourceType: "module",
  plugins: [
    // '@babel/plugin-transform-typescript'
  ],
}

let filePath = 'plugins/dummyPlugin/dummyPlugin.mjs'

fs.readFile(
  path.join(__dirname, filePath),
  { encoding: 'UTF8' }
).then((data) => {
  let ast = parser.parse(data, parseOptions);
  
  let functions = ast.program.body.filter((node) => { 
    return node.type === 'FunctionDeclaration';
  });

  let functionNames = functions.map((node) => { 
    return node.id.name;
  });
  
  msg(strfy(functionNames));

  fs.writeFile('functions.json', strfy(functions));
}).catch((e) => {
  console.log(`Parse unsuccessful with error: ${e}`)
})



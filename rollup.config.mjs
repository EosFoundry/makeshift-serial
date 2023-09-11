import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json';

import { readFileSync } from 'fs';
import path from 'path';

const tsconfig = JSON.parse(readFileSync('./tsconfig.json'))

// this is a workaround for 
// https://github.com/rollup/plugins/issues/1253

delete tsconfig.typedocOptions
tsconfig.compilerOptions.declarationDir = path.resolve('./lib/types')

console.log(tsconfig)

export default {
  input: './src/index.ts',
  external: [
    'serialport'
  ],
  output: [
    {
      file: 'lib/makeshift-serial.mjs',
      format: 'module',
      inlineDynamicImports: true,
    },
    {
      file: 'lib/makeshift-serial.umd.cjs',
      format: 'cjs',
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    typescript(tsconfig),
    json(),
    nodeResolve({
      exportConditions: ['node']
    }),
    commonjs(),
    terser()
  ]
};

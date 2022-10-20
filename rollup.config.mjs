import typescript from 'rollup-plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.ts',
  external: [
    'serialport'
  ],
  output: {
    file: 'lib/makeshift-serial.js',
    format: 'module',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
  ]
};
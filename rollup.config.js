import typescript from 'rollup-plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/makeShiftPort.ts',
  external: [
    'serialport'
  ],
  output: {
    file: 'lib/makeshift-serial.js',
    format: 'module',
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    nodeResolve(),
    commonjs(),
  ]
};
import typescript from 'rollup-plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/index.ts',
  external: [
    'serialport'
  ],
  output: [
    {
      file: 'lib/makeshift-serial.mjs',
      format: 'module',
    },
    {
      file: 'lib/makeshift-serial.umd.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    nodeResolve({
      exportConditions: ['node'],
    }),
    commonjs(),
  ]
};
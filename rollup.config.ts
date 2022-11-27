import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser'

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
      file: 'lib/makeshift-serial.umd.js',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    nodeResolve({
      exportConditions: ['node'],
    }),
    commonjs(),
    terser()
  ]
};
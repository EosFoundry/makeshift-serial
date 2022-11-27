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
    typescript({ // this is a workaround
      tsconfig: false,
      "include": [
        "./src/*"
      ],
      "exclude": [
        "./lib",
      ],
      "compilerOptions": {
        "module": "ESNext",
        "target": "ESNext",
        "resolveJsonModule": true,
        "moduleResolution": "node",
        "allowSyntheticDefaultImports": true,
        "declaration": false,
      },
    }),
    nodeResolve({
      exportConditions: ['node'],
    }),
    commonjs(),
    terser()
  ]
};
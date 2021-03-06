import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import image from '@rollup/plugin-image';
import postcss from "rollup-plugin-postcss"
import resolve from '@rollup/plugin-node-resolve'
import { string } from "rollup-plugin-string";
import url from '@rollup/plugin-url'



import pkg from './package.json'

const rollup = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    commonjs(),
    external(),
    image(),
    postcss(),
    resolve(),
    string({ include: ["**/*.vert", "**/*.frag"] }),
    url(),    
  ]
}
export default rollup

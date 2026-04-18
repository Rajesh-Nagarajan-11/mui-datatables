import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import uglify from '@lopatnov/rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  // [TEST-ONLY] '__mui-datatables-breaking-test__' is declared external so rollup
  // passes it through to dist/index.js as a require(). Meshery UI's Next.js webpack
  // will then fail with "Module not found" when it tries to bundle this package.
  external: ['__mui-datatables-breaking-test__'],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    babel({
      babelHelpers: 'runtime',
      babelrc: true,
    }),
    uglify({
      compress: {
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
    sourcemap: true,
  },
};

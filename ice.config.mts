import { defineConfig } from '@ice/app';

// The project config, see https://v3.ice.work/docs/guide/basic/config
const minify = process.env.NODE_ENV === 'production' ? 'swc' : false;
export default defineConfig(() => ({
  publicPath:'./',
  devPublicPath:'./',
  // Set your configs here.
  minify,
  server: {
    onDemand: true,
    format: 'esm',
  },
}));

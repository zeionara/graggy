const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
      // config['node'] = {fs: 'empty'}
      // return config
      // return {'resolve': {'fallback': {'fs': false, 'zlib': false, 'path': false, 'crypto': false}}}
      return {
          'resolve': {
              'fallback': {
                  'fs': false,
                  'path': require.resolve('path-browserify'),
                  'zlib': require.resolve('browserify-zlib'),
                  'crypto': require.resolve('crypto-browserify'),
                  'assert': require.resolve('assert/'),
                  'util': require.resolve('util/'),
                  'stream': require.resolve('stream-browserify'),
                  'buffer': require.resolve('buffer')
              }
          }
      }
      // return {'node': {'fs': 'empty'}}
      // return {}
  }
})

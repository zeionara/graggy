const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
      // config['node'] = {fs: 'empty'}
      // return config
      // return {'resolve': {'fallback': {'fs': false}}}
      // return {'node': {'fs': 'empty'}}
      return {}
  }
})

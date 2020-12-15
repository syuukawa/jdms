const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src/renderer'))
      .set('~', resolve('src'))
      .set('root', resolve('./'))
    // 将 icons 目录排除在 svg 默认规则之外
    config.module
      .rule('svg')
      .exclude.add(resolve('src/renderer/icons'))
      .end()
    // 用 svg-sprite-loader 处理 icons 下的 svg
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/renderer/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      chainWebpackMainProcess: (config) => {
        config.resolve.alias
          .set('@', resolve('src/renderer'))
          .set('~', resolve('src'))
          .set('root', resolve('./'))
      },
      mainProcessWatch: ['src/main/api/index.js'],
      builderOptions: {
        productName: '京东抢购助手',
        dmg: {},
        mac: {},
        win: {
          target: ['nsis', 'zip']
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        }
      }
    }
  }
}

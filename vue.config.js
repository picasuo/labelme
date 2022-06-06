/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const resolve = dir => path.resolve(__dirname, dir)

module.exports = {
  //   publicPath: '/foo/',

  lintOnSave: true,
  productionSourceMap: false,
  devServer: {
    https: false,
    // proxy: {
    //   '/portrait': {
    //     target: 'http://192.168.199.249:22000',
    //   },
    // },
  },
  css: {
    loaderOptions: {
      sass: {
        /**
         * data 在新版本中被遗弃
         * prependData 用于在分享基础样式数据 (通过插入到对应样式文件中 重复!)
         * 测试发现多个打包的样式头部都插入了相同的基础数据
         * 解决方式: 在 main.js 中单独引入
         *
         * 问题记录: 虽然 main.js 中全部引入样式,但是在组件编写中想使用 scss variable 显示变量未定义
         * 解决方式: 单独将 scss 变量、函数等 append 到每个 scss 前 (https://github.com/webpack-contrib/sass-loader#prependdata)
         * 变量等不会被打包只存在于 scss
         */
        prependData: `@import "~@/assets/scss/abstracts/_index.scss";`,
      },
    },
  },
  configureWebpack: {
    resolve: {
      extensions: ['.scss'],
      alias: {
        assets: resolve('src/assets'),
        components: resolve('src/components'),
        config: resolve('src/config'),
        router: resolve('src/router'),
        service: resolve('src/service'),
        layouts: resolve('src/layouts'),
        store: resolve('src/store'),
        views: resolve('src/views'),
        utils: resolve('src/utils'),
        ts: resolve('src/ts'),
        scss: resolve('src/assets/scss'),
      },
    },
    externals: {
      './cptable': 'var cptable',
    },
    plugins: [new HardSourceWebpackPlugin()],
  },
  chainWebpack: config => {
    /**
     * webpack 分块机制:
     * 根据模块 引用次数 大小(def:>30k) 最大同时请求数 首页请求数 决定
     * (异步引入直接分块 其内部也根据分块机制继续执行)
     * 配置优先级: ui > vendors > commons
     * 执行如下:
     * 从 main 主入口开始分析依赖
     * 根据分组优先级 将 ui 分块到 chunk-ui
     * 将例如vue等大小超过30k的模块 分块到 chunk-vendors
     * 若某些模块多次引用则 分块到 chunk-commons
     */
    config.optimization
      // .minimizer('css')
      // .use(OptimizeCssAssetsWebpackPlugin, [
      //   {
      //     assetNameRegExp: /\.css$/g,
      //     cssProcessor: require('cssnano'),
      //     cssProcessorPluginOptions: {
      //       preset: ['default', { discardComments: { removeAll: true } }],
      //     },
      //   },
      // ])
      // .end()
      .minimizer('terser')
      .tap(args => {
        const { terserOptions } = args[0]
        terserOptions.compress.drop_debugger = true
        terserOptions.compress.drop_console = true
        terserOptions.output = { comments: false }
        return args
      })
      .end()
      .splitChunks({
        chunks: 'all',
        cacheGroups: {
          ui: {
            name: 'chunk-ui',
            test: /[\\/]node_modules[\\/](element-ui|iview|sx-sui-design)[\\/]/,
            priority: -5,
          },
          // echarts: {
          //   name: 'chunk-echarts',
          //   test: /[\\/]node_modules[\\/](echarts)[\\/]/,
          //   priority: -5,
          // },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial',
          },

          /**
           * 待讨论:
           * 1. commons 分块将多次引入模块分块 倘若当前该分块较大 切某个页面仅引用分块中的某个很小的库 也需要全部下载
           * 2. 或者极小的库被分块出来 使用则要多请求一次
           */
          commons: {
            name: 'chunk-commons',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      })
    config
      .plugin('provide')
      .use(webpack.ProvidePlugin, [
        {
          _: 'lodash',
          moment: 'moment',
        },
      ])
      .end()
      .plugin('context-replacement')
      // moment 语言包默认仅加载 zh-cn
      .use(webpack.ContextReplacementPlugin, [/moment[/\\]locale$/, /zh-cn/])
  },
}

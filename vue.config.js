module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://mcp-solana-api.codexaeternum.tech',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/mcp'
        }
      }
    }
  }
}

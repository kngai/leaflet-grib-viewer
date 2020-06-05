let today = new Date().toLocaleDateString(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})
process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_BUILD_DATE = today

module.exports = {
  publicPath: process.env.PUBLIC_PATH !== null
    ? process.env.PUBLIC_PATH // for different deployment environments of root path to web app
    : '/',

  "transpileDependencies": [
    "vuetify"
  ]
}

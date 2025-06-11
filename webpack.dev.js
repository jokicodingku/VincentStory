const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
      watch: true,
    },
    port: 9001,
    host: "0.0.0.0",
    client: {
      overlay: false,
      progress: false,
      reconnect: false,
    },
    hot: true,
    liveReload: false,
    open: false,
    devMiddleware: {
      writeToDisk: true,
      stats: "errors-only",
    },
    watchFiles: ["./src/**/*"],
  },
});

# Webpack "Copy on build" plugin

Webpack will copy all output files to given destination

#### Usage

`webpack.config.js`:

```
const WebpackCopyOutputOnBuildPlugin = require("webpack-copy-output-on-build-plugin");

module.exports = {
    plugins: [
        new WebpackCopyOutputOnBuildPlugin({
            copyPaths: [path.join(__dirname, '/any/path/you/like')],
            logCopy: true,
        })
    ],
}
```
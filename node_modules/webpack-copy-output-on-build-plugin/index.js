const path = require('path');
const fs = require('fs');

class WebpackCopyOutputOnBuildPlugin {
    constructor(options) {
        const newOptions = {
            copyPaths: [],
            logCopy: false,
        }
        for (let optionsKey in options) {
            newOptions[optionsKey] = options[optionsKey]
        }
        this.options = newOptions;
    }

    apply = compiler => {
        compiler.hooks.assetEmitted.tap(
            'WebpackCopyOutputOnBuildPlugin',
            (file, { outputPath, targetPath }) => {
                let paths = this.options.copyPaths || [];
                paths.forEach(targetOutputPath => {
                    let relativePath = path.relative(outputPath, targetPath),
                        newTargetPath = path.resolve(targetOutputPath, relativePath),
                        targetDir = path.dirname(newTargetPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, {recursive: true});
                    }
                    fs.copyFile(targetPath, newTargetPath, err => {
                        if (err) {
                            console.error('[WebpackCopyOutputOnBuildPlugin error]', err);
                        } else if (this.options.logCopy) {
                            console.log('[WebpackCopyOutputOnBuildPlugin copy]', newTargetPath);
                        }
                    });
                });
            }
        );
    };
}

module.exports = WebpackCopyOutputOnBuildPlugin
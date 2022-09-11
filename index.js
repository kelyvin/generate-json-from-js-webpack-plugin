const PLUGIN_NAME = "GenerateJsonFromJsPlugin";
const path = require("path");

const defaultJsonOptions = {
  replacer: null,
  space: 2,
};

class GenerateJsonFromJsPlugin {
  constructor(config = {}) {
    Object.assign(this, {
      ...config,
      filePath: config.path,
      filename: config.filename,
      data: config.data || {},
      options: {
        ...defaultJsonOptions,
        ...config.options,
      },
    });
    this.plugin = PLUGIN_NAME;
  }
  apply(compiler) {
    const emit = (compilation) => {
      const fullFilePath = path.resolve(compiler.context, this.filePath);

      // Adding this causes a "rebuild" when the template file changes and indicate when the file has changed
      compilation.fileDependencies.add(fullFilePath);
      process.stdout.write(`\n${green("Rebuilding ")}${this.filename}\n`);

      const jsModule = require(fullFilePath);
      let jsonValue = null;

      if (typeof jsModule === "function") {
        jsonValue = jsModule(this.data);
      } else if (typeof jsModule === "object") {
        jsonValue = {
          ...jsModule,
          ...this.data,
        };
      }

      if (jsonValue) {
        const json = JSON.stringify(
          jsonValue,
          this.options.replacer,
          this.options.space
        );

        compilation.assets[this.filename] = {
          source: () => json,
          size: () => json.length,
        };
      }
    };

    if (compiler.hooks) {
      compiler.hooks.thisCompilation.tap(this.plugin, emit);
    } else {
      compiler.plugin("emit", emit);
    }
  }
}
module.exports = GenerateJsonFromJsPlugin;

function green(str) {
  return "\u001b[1m\u001b[32m" + str + "\u001b[39m\u001b[22m";
}

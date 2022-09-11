const path = require("path");
const chalk = require("chalk");

const defaultJsonOptions = {
  replacer: null,
  space: 2,
};

function GenerateJsonFromJsPlugin(config = {}) {
  Object.assign(this, {
    ...config,
    filePath: config.path,
    filename: config.filename,
    data: config.data || [],
    options: {
      ...defaultJsonOptions,
      ...config.options,
    },
  });

  this.plugin = "GenerateJsonFromJsPlugin";
}

GenerateJsonFromJsPlugin.prototype.apply = function apply(compiler) {
  const emit = (compilation, callback) => {
    const fullFilePath = path.resolve(compiler.context, this.filePath);

    // Adding this causes a "rebuild" when the template file changes and indicate when the file has changed
    compilation.fileDependencies.add(fullFilePath);
    process.stdout.write(`\n${chalk.green("Rebuilding ")}${this.filename}\n`);

    const jsModule = require(fullFilePath);
    let jsonValue = null;

    if (typeof jsModule === "function") {
      jsonValue = jsModule(this.data);
    } else if (jsModule instanceof Array) {
      jsonValue = [...jsModule, ...this.data];
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

    callback();
  };

  if (compiler.hooks) {
    compiler.hooks.emit.tapAsync(this.plugin, emit);
  } else {
    compiler.plugin("emit", emit);
  }
};

module.exports = GenerateJsonFromJsPlugin;

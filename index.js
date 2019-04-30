const path = require('path')
const chalk = require('chalk')

const defaultJsonOptions = {
  replacer: null,
  space: 2
}

function GenerateJsonFromJsPlugin(config = {}) {
  Object.assign(this, {
    ...config,
    filePath: config.path,
    filename: config.filename,
    data: config.data || {},
    options: {
      ...defaultJsonOptions,
      ...config.options
    }
  })

  this.plugin = { name: 'GenerateJsonFromJsPlugin' };
}

GenerateJsonFromJsPlugin.prototype.apply = function apply(compiler) {
  const emit = (compilation, callback) => {
    // Adding this line causes a "rebuild" when the template file changes and indicate when the file has changed
    const fullFilePath = path.resolve(compiler.context, this.filePath)
    compilation.fileDependencies.add(path.join(compiler.context, this.filePath));
    process.stdout.write(`${chalk.green('Rebuilding ')}${this.filename}\n`);

    const jsModule = require(fullFilePath)
    let json = null

    if (typeof jsModule === 'function') {
      json = JSON.stringify(jsModule(this.value), this.options.replacer, this.options.space)
    } else if (typeof jsModule === 'object') {
      json = JSON.stringify({ ...jsModule, ...this.value }, this.options.replacer, this.options.space)
    }

    if (json) {
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
    compiler.plugin('emit', emit);
  }
};

module.exports = GenerateJsonFromJsPlugin;

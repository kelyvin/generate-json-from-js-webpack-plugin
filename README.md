# generate-json-from-js-webpack-plugin
This webpack plugin generates a custom JSON asset from a JS module. This plugin is fairly barebones and was primarily created to easily generate a `manifest.json` file from a javascript module.

Requires webpack 4.

**NOTE:** Even though the referenced JS module is being watched, this plugin does not recompile the JSON file on changes to the JS file. I would like some help on this as tracked [here](https://github.com/kelyvin/generate-json-from-js-webpack-plugin/issues/1)

## Installation
To begin, you'll need to install `generate-json-from-js-webpack-plugin`

```bash
# If using npm
npm install generate-json-from-js-webpack-plugin

# If yarn
yarn add generate-json-from-js-webpack-plugin
```

## Options
The plugin's signature:

**`webpack.config.js`**

```js
module.exports = {
  plugins: [new GenerateJsonFromJsPlugin(config)],
};
```

### Config
|               Name                |         Type          |                     Default                     | Description                                                                                                               |
| :-------------------------------: | :-------------------: | :---------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------|
|          [`path`](#path)          |      `{String}`       |                   `undefined`                   | Glob or path of the JS module we want to convert. It can return an object or a function that returns an object (required) |
|      [`filename`](#filename)      |      `{String}`       |                   `undefined`                   | The output JSON filename `(required)`                                                                                     |
|          [`data`](#data)          |      `{Object}`       |                      `{}`                       | The javascript object that we want to append to the generaed JSON. Will override any values of the original JS module     |
|       [`options`](#options)       |      `{Object}`       |          `{ replacer: null, spaces: 2}`         | The replacer and space arguments provided to [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) to customize the JSON output |

## Simple example
You'll need to create a JS file that you want to export as a JSON file and include the plugin in your webpack config.

**`webpack.config.js`**
```js
const GenerateJsonFromJsPlugin = require('generate-json-from-js-webpack-plugin');

module.exports = {
  // ...
  output: {
    path: 'dist'
  },
  plugins: [
    // ...
    new GenerateJsonFromJsPlugin({
      path: './manifest.js',
      filename: 'manifest.json',
      data: {
        description: 'Test generate json from js'
      }
    })
  ]
  // ...
};
```

**`manifest.js`**
```js
const permissions = [
  'storage',
  'activeTab'
]

module.exports = {
  'manifest_version': 2,
  'version': '0.0.1',
  permissions
}
```

This will create a `manifest.json` file in webpack's output directory with the following content:

```json
{
  "manifest_version": 2,
  "version": "0.0.1",
  "description": "Test generate json from js",
  "permissions": [
    "storage",
    "activeTab"
  ]
}
```

## Advanced example
In the simple example above, you'll see that the JS module returns an object. The exported object will also include any additional fields as specified in the `data` config option.

Your JS module can also export a function instead. If you do this, then the `data` object will not be included in the JSON output, but will instead be provided as an argument to module. We enable this capability to allow more granular control on what you want to output in the JSON file or perform environment level configurations.

1. This plugin will execute the function immediately and expects the module to return an object.
2. The plugin will execute the function and provide the `data` config option as an argument to that function

**`webpack.config.js`**
```js
const GenerateJsonFromJsPlugin = require('generate-json-from-js-webpack-plugin');

module.exports = {
  // ...
  output: {
    path: 'dist'
  },
  plugins: [
    // ...
    new GenerateJsonFromJsPlugin({
      path: './manifest.js',
      filename: 'manifest.json',
      data: {
        env: process.env.NODE_ENV
      }
    })
  ]
  // ...
};
```

**`manifest.js`**

```js
const permissions = [
  'storage',
  'activeTab'
]

module.exports = (configs = {}) => {
  if (configs.env && configs.env === 'production') {
    permissions.push('cookies')
  }

  return {
    'manifest_version': 2,
    'version': '0.0.1',
    permissions
  }
}
```

**Output**

```json
{
  "manifest_version": 2,
  "version": "0.0.1",
  "permissions": [
    "storage",
    "activeTab",
    "cookies"
  ]
}
```

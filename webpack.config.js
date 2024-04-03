/**
 * Copyright 2011-2021 Couchbase, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//@ts-check

"use strict";

const path = require("path");

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
  target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: {
     "extension": "./src/extension.ts"
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/

  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};

/**@type {import('webpack').Configuration}*/
const reactConfig = {
  target: "web",
  entry: {
    reactBuild: "./src/reactViews/app/index",
  },
  output: {
    path: path.resolve(__dirname, "dist/workbench"),
    filename: "[name].js",
  },
  devtool: "source-map",
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      'components': path.resolve(__dirname, 'src/reactViews/app/components'),
      'utils': path.resolve(__dirname, 'src/reactViews/app/utils'),
      'constants': path.resolve(__dirname, 'src/reactViews/app/constants'),
      'sync': path.resolve(__dirname, 'src/reactViews/app/sync'),
      'hooks': path.resolve(__dirname, 'src/reactViews/app/hooks'),
      'error': path.resolve(__dirname, 'src/reactViews/app/error'),
      'custom': path.resolve(__dirname, 'src/reactViews/app/custom'),
      'types': path.resolve(__dirname, 'src/reactViews/app/types'),
      'assets': path.resolve(__dirname, 'src/reactViews/app/assets'),
    },
    fallback: {
      "path": false,
      "fs": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "src/reactViews/app/tsconfig.json",
            },

          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader", // You can also use "url-loader" if you prefer
            options: {
              name: "[name].[ext]", // Output file name and extension
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/, // Regular SCSS files (without CSS modules)
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [],
};

const iqReactConfig = {
  mode: 'development',
  target: 'web',
  entry: {
    index: path.resolve(__dirname, 'src/reactViews/iq/index.tsx')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', ".jsx"]
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/iq')
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.scss$/, // Regular SCSS files (without CSS modules)
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader", // You can also use "url-loader" if you prefer
            options: {
              name: "[name].[ext]", // Output file name and extension
            },
          },
        ],
      },
    ]
  }
};

module.exports = [extensionConfig, reactConfig, iqReactConfig];
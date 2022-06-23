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

const rebuild = require('electron-rebuild').default;
const fs = require("fs");
const fsp = require("fs/promises");
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

Promise.resolve()
  .then(_ => {
    return rebuild({
      buildPath: ROOT_DIR,
      electronVersion: '17.2.0'
    });
  })
  .then(_ => {
    if (!fs.existsSync(`${ROOT_DIR}/build/couchbase_impl.node`)) {
      return fsp.mkdir(path.dirname(`${ROOT_DIR}/build/couchbase_impl.node`));
    }
    return Promise.resolve();
  })
  .then(_ => {
    return fsp.copyFile(`${ROOT_DIR}/node_modules/couchbase/build/Release/couchbase_impl.node`, `${ROOT_DIR}/build/couchbase_impl.node`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });

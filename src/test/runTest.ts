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

import * as path from 'path';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Cleanup step
    // fs.rmSync, not fs.rmdirSync: the `recursive` option was deprecated on
    // rmdirSync in Node 14 and removed outright in newer releases, where
    // passing it throws ERR_INVALID_ARG_VALUE. `force` also makes the
    // existence check redundant, but it is kept for clarity.
    const userDataPath = path.resolve(__dirname, '../../.vscode-test/user-data');
    if (fs.existsSync(userDataPath)) {
      fs.rmSync(userDataPath, { recursive: true, force: true });
    }

    // Get the test file from command line arguments
    const testFile = process.argv[2];
    if (testFile) {
      process.env.VSCODE_TEST_FILE = testFile;
    }

    // Download VS Code, unzip it and run the integration test.
    //
    // The version is pinned rather than left to float on `stable`, for two
    // reasons. It makes the run reproducible: an unpinned job silently tests
    // against whatever VS Code shipped that day, so it can break with no
    // change to this repository. And VS Code 1.110 renamed the macOS
    // executable from `Contents/MacOS/Electron` to `Contents/MacOS/Code`,
    // which the pinned @vscode/test-electron 2.4.0 does not know about - on
    // any 1.110+ build it fails with `spawn .../Contents/MacOS/Electron
    // ENOENT`, macOS only. Testing against the `engines.vscode` floor also
    // means we verify the oldest VS Code the extension claims to support.
    //
    // Raising this past 1.109 requires @vscode/test-electron 3.x, which in
    // turn requires Node >= 22 (CI currently pins Node 20).
    await runTests({
      version: '1.108.0',
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: testFile ? ['--disable-extensions', '--extensionTestsPath=' + extensionTestsPath, '--testFile=' + testFile] : undefined
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();

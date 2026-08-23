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

    // Download VS Code, unzip it and run the integration test
    await runTests({ 
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

/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { Cluster } from "couchbase";

export type ConnectionAuthType = "password" | "certificate";

export interface IConnection {
  readonly url: string;
  // For certificate connections: the user the certificate maps to (its CN), for display and the connection id
  readonly username: string;
  readonly password?: string;
  readonly connectionIdentifier: string;
  readonly isSecure: boolean;
  // Missing on connections saved before certificate login existed, which all use a password
  readonly authType?: ConnectionAuthType;
  // PEM files, used when authType is "certificate"
  readonly certificatePath?: string;
  readonly keyPath?: string;
  // Optional CA to trust the cluster's TLS certificate (PEM)
  readonly caPath?: string;
  services?: string[];
  cluster?: Cluster;
}

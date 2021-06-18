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
import * as vscode from 'vscode';

export class Global{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        Global.state = context;
    }
}
export class WorkSpace{
    static state:vscode.Memento;
    static setState(context:vscode.Memento){
        WorkSpace.state = context;
    }
}
class LocalState{
    constructor(private state:{ [s: string]: any; }){

    }
    get<T>(key: string): T | undefined{
        if(this.state[key]){
            return this.state[key];
        }
        return;
    }
    update(key: string, value: any): Thenable<void>{
        return new Promise(() => {
            this.state[key] = value;
        });
    }
}
export class Memory {
    static setState(){
        Memory.state = new LocalState({});
    }
    static state:LocalState;
}

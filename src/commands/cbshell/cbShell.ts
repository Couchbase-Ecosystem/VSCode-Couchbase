import * as vscode from 'vscode';
import ConnectionEvents from '../../util/events/connectionEvents';
import { SecretService } from '../../util/secretService';
import { Constants } from '../../util/constants';
import { getConnectionId } from '../../util/connections';
import { CBTools, Type } from '../../util/DependencyDownloaderUtils/CBTool';


export class CBShell {
    private static instance: CBShell | undefined;
    private terminal: vscode.Terminal | undefined;
    private context: vscode.ExtensionContext | undefined;

    private constructor(context?: vscode.ExtensionContext) {
        // All Cbshell events are handled here
        ConnectionEvents.onConnectionChanged(async (connection) => {
            if (this.terminal) {
                this.terminal.dispose();
                this.terminal = undefined;
            }
            if(context){
                this.context = context;
            }
            const secretService = SecretService.getInstance();
            const password = await secretService.get(`${Constants.extensionID}-${getConnectionId(connection)}`);
            if (!password) {
                return undefined;
            }
            this.terminal = vscode.window.createTerminal({ name: 'CBShell' });
            
            if(this.context){
                this.context.environmentVariableCollection.replace('CB_PASSWORD', password);
            }
            const cmd: string[] = [];
            cmd.push(CBTools.getTool(Type.SHELL).path);
            cmd.push("--connstr");
            cmd.push(connection.url);
            cmd.push("-u");
            cmd.push(connection.username);
            cmd.push("-p");
            cmd.push(`$CB_PASSWORD`);
            cmd.push("--disable-tls");
            cmd.push("--disable-config-prompt");
            this.terminal.sendText(cmd.join(' '));
        });

        ConnectionEvents.onConnectionRemoved(() => {
            if (this.terminal) {
                this.terminal.dispose();
                this.terminal = undefined;
            }
        });
    }

    public static getInstance(context?: vscode.ExtensionContext): CBShell {
        if (!CBShell.instance) {
            CBShell.instance = new CBShell(context);
        }
        return CBShell.instance;
    }
}
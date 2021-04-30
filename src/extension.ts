import * as vscode from 'vscode';
import { ClusterConnectionNode } from './model/ClusterConnectionNode';
import DocumentNode from './model/DocumentNode';
import { INode } from './model/INode';
import ClusterConnectionTreeProvider from './tree/ClusterConnectionTreeProvider';
import { addConnection, useConnection } from './util/connections';
import { Constants } from './util/constants';
import { MemFS } from './util/fileSystemProvider';
import { getDocument } from './util/requests';
import { Global, Memory, WorkSpace } from './util/util';

export function activate(context: vscode.ExtensionContext) {
	Global.setState(context.globalState);
	WorkSpace.setState(context.workspaceState);
	Memory.setState();
	Memory.state.update('vscode-couchbase', vscode.workspace.getConfiguration('vscode-couchbase'));

	const subscriptions = context.subscriptions;

	const clusterConnectionTreeProvider = new ClusterConnectionTreeProvider(context);

	const memFs = new MemFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('couchbase', memFs, { isCaseSensitive: true }));

	subscriptions.push(vscode.window.registerTreeDataProvider('couchbase', clusterConnectionTreeProvider));

	subscriptions.push(vscode.commands.registerCommand('vscode-couchbase.createClusterConnection', async () => {
		await addConnection();
		clusterConnectionTreeProvider.refresh();
	}));

	subscriptions.push(vscode.commands.registerCommand('vscode-couchbase.deleteClusterConnection', async (connection: ClusterConnectionNode|undefined) => {
		if(connection){
			await connection.deleteConnection(context, clusterConnectionTreeProvider);
			clusterConnectionTreeProvider.refresh();
			return;
		}
		Global.state.update(Constants.connectionKeys, {});
	}));

	subscriptions.push(vscode.commands.registerCommand('vscode-couchbase.refreshConnection', (node:INode) => {
		clusterConnectionTreeProvider.refresh(node);
	}));

	subscriptions.push(vscode.commands.registerCommand('vscode-couchbase.useClusterConnection', async (connection: ClusterConnectionNode) => {
		await useConnection(connection);
		clusterConnectionTreeProvider.refresh(connection);
        const previousConnection = Memory.state.get<INode>('previousConnection');
        if(previousConnection){
            clusterConnectionTreeProvider.refresh(previousConnection);
        }
        Memory.state.update('previousConnection', connection);
	}));

	subscriptions.push(vscode.commands.registerCommand('vscode-couchbase.openDocument', async (documentNode: DocumentNode) => {
		try {
			let documentData = await getDocument(documentNode);
			const uri = vscode.Uri.parse(`couchbase:/${documentData.meta.id}.json`);
			memFs.writeFile(vscode.Uri.parse(`couchbase:/${documentData.meta.id}.json`), Buffer.from(JSON.stringify(documentData, null, 2)), { create: true, overwrite: true });
			const document = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(document, { preview: false });
			return true;
		  } catch (error) {
			console.log(error);
		  }
		}
	));

}

// this method is called when your extension is deactivated
export function deactivate() {}

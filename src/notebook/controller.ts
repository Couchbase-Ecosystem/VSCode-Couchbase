import * as vscode from 'vscode';
import { getActiveConnection } from '../util/connections';

export class QueryKernel {
    private readonly _id = 'couchbase-query-notebook-kernel';
    private readonly _label = 'New Couchbase Query Notebook';
    private readonly _supportedLanguages = ['json', 'sql++'];

    private _executionOrder = 0;
    private readonly _controller: vscode.NotebookController;

    constructor() {
        this._controller = vscode.notebooks.createNotebookController(this._id,
            'couchbase-query-notebook',
            this._label);
        this._controller.supportedLanguages = this._supportedLanguages;
        this._controller.supportsExecutionOrder = true;
        this._controller.executeHandler = this._executeAll.bind(this);
    }

    dispose(): void {
        this._controller.dispose();
    }

    private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
        for (const cell of cells) {
            this._doExecution(cell);
        }
    }

    private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);

        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now());

        try {
            const activeConnection = getActiveConnection();
            if (!activeConnection) {
                return;
            };
            const result = await activeConnection.cluster?.query(
                cell.document.getText()
            );
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(result?.rows)
            ])]);

            execution.end(true, Date.now());
        } catch (err) {
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.error(err as Error)
            ])]);
        }
        execution.end(false, Date.now());
    }
}
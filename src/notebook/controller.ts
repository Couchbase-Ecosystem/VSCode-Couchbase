import * as vscode from 'vscode';
import { getActiveConnection } from '../util/connections';
import {
    BucketNotFoundError, CollectionNotFoundError, DocumentNotFoundError,
    ParsingFailureError, ScopeNotFoundError
} from 'couchbase';

export class QueryKernel {
    private readonly _id = 'couchbase-query-notebook-kernel';
    private readonly _label = 'New Couchbase Query Notebook';
    private readonly _supportedLanguages = ['sql++', 'json'];

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
            const errorArray = [];
            if (
                err instanceof ParsingFailureError ||
                err instanceof BucketNotFoundError ||
                err instanceof CollectionNotFoundError ||
                err instanceof DocumentNotFoundError ||
                err instanceof ScopeNotFoundError
            ) {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const { first_error_code, first_error_message, statement } = err.cause as any;
                errorArray.push({
                    code: first_error_code,
                    msg: first_error_message,
                    query: statement,
                });
            }
            else {
                errorArray.push(err);
            }
            execution.replaceOutput([new vscode.NotebookCellOutput([
                vscode.NotebookCellOutputItem.json(errorArray)
            ])]);
        }
        execution.end(false, Date.now());
    }
}
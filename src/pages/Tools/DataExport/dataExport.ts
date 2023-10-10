import { CBExport } from "../../../tools/CBExport";
import { CBTools, Type as CBToolsType } from "../../../util/DependencyDownloaderUtils/CBTool";
import * as vscode from 'vscode';

export const dataExport = async () => {
    if (!CBTools.getTool(CBToolsType.CB_EXPORT).isAvailable()) {
        vscode.window.showErrorMessage("CB Export is still loading, Please try again later");
        return;
    }
    

    CBExport.export(`travel-sample`, ['All Scopes'], [], '/Users/lokeshgoel/Documents', 'cbmid', 'cbms', 'cbmc', 'lines', '4', false);
};
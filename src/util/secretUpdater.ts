import { ExtensionContext } from "vscode";

import * as fs from 'fs';
import * as path from 'path';

export const secretUpdater = (context: ExtensionContext) => {   
    const config = JSON.parse(fs.readFileSync(path.join(__filename,"..", "config.json")).toString());
    console.log("config",config);

    context.globalState.update("feedbackLambdaSecret", config.FEEDBACK_LAMBDA_SECRET);
    context.globalState.update("feedbackLambdaUrl", config.FEEDBACK_LAMBDA_URL);
};
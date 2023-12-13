import { ExtensionContext } from "vscode";


// Before Building, Please update secrets else IQ Feedback service will not work
export const secretUpdater = (context: ExtensionContext) => {
    context.globalState.update("feedbackLambdaSecret", "YOUR_SECRET_HERE");
    context.globalState.update("feedbackLambdaUrl", "YOUR_URL_HERE");
};
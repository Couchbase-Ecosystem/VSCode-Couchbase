import { ExtensionContext } from "vscode";

// Before Building, Please update secrets else IQ Feedback service will not work
export const secretUpdater = (context: ExtensionContext) => {
    context.globalState.update("feedbackLambdaSecret", "c0uchbase_is_aw3some");
    context.globalState.update("feedbackLambdaUrl", "https://nms548yy5b.execute-api.us-west-1.amazonaws.com/Prod/");
};
import { ExtensionContext } from "vscode";
import * as dotenv from 'dotenv';

// Before Building, Please update secrets else IQ Feedback service will not work
export const secretUpdater = (context: ExtensionContext) => {
    dotenv.config();
    console.log(process.env);
    console.log("secret: ", process.env.FEEDBACK_LAMBDA_SECRET);
    console.log("url: ", process.env.FEEDBACK_LAMBDA_URL);

    context.globalState.update("feedbackLambdaSecret", process.env.FEEDBACK_LAMBDA_SECRET);
    context.globalState.update("feedbackLambdaUrl", process.env.FEEDBACK_LAMBDA_URL);
};
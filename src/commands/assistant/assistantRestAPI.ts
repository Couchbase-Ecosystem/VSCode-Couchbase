import axios from "axios";
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { Global, Memory } from "../../util/util";

export class AssistantRestAPI {
    // Capella Prod domain
    private static ASSISTANT_URL_DOMAIN = "http://127.0.0.1:8000";

    public static askAssistant = async (
        messageBody: any
    ): Promise<any> => {
        let result:any = {
            content: "",
            error: undefined,
            status: "",
        };
        try {
            const content = await axios.post(
                `${this.ASSISTANT_URL_DOMAIN}/chat_postman`,
                messageBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Connection: "keep-alive",
                    },
                }
            );

            if (
                content.data.choices === undefined ||
                content.data.choices.length === 0
            ) {
                result.status = "NoLogout";
                result.error = content.data.error;
                return result;
            }
            result.content = content.data.choices[0].message.content;
            result.status = content.status.toString();
        } catch (error: any) {
            try {
                if (error.response && error.response.status === 401) {
                    result.error =
                        "The current session has expired. Please login again.";
                    result.status = "401";
                } else if (
                    error.response.data !== undefined &&
                    error.response.data.errorType !== undefined
                ) {
                    result.error = error.response.data.message;
                    result.status = error.response.data.errorType;
                } else if (error.status) {
                    result.error = error.statusText;
                    result.status = error.status;
                } else if (error.response) {
                    result.error = error.response;
                    result.status = error.response.status.toString();
                } else {
                    logger.error(
                        "Error while receiving message from iQ: " + error
                    );
                    result.status = "400";
                    result.error =
                        "Error while receiving message from iQ: " + error;
                }
            } catch (e) {
                result.status = "400";
                result.error = "Error while processing iQ message";
            }
        }
        return result;
    };

}

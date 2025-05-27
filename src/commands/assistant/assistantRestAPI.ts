import axios from "axios";
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { AssistantResponse } from "./chat/types";
import { Constants } from "../../util/constants";

export class AssistantRestAPI {
    // iQ-fastapi Prod domain
    private static ASSISTANT_URL_DOMAIN = Constants.IQ_FAST_API_URL;

    public static askAssistant = async (
        messageBody: string
    ): Promise<AssistantResponse> => {
        let result: AssistantResponse = {
            content: "",
            error: undefined,
            status: "",
            threadId: "",
            runId: "",
            tool_args: null
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
            
            if (content.data) {
                // TODO: Remove this after testing in next release
                console.log("Assistant response from API call: ", content.data);
                result.content = content.data.content || "";
                result.threadId = content.data.thread_id || "";
                result.runId = content.data.run_id || "";
                result.tool_args = content.data.tool_args || null;
                result.status = content.status.toString();
                return result;
            }

            result.status = "NoLogout";
            result.error = "Invalid response format";
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
                result.error = "Error while processing iQ message: " + e;
            }
        }
        return result;
    };

    public static restartAssistant = async (messageBody: string): Promise<any> => {
        const response = await axios.post(`${this.ASSISTANT_URL_DOMAIN}/restart_postman`,
            messageBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    Connection: "keep-alive",
                },
            }
        );
        return response.data;
    };

    public static sendFeedback = async (messageBody: string): Promise<any> => {
        try {
            const response = await axios.post(
                `${this.ASSISTANT_URL_DOMAIN}/docs/feedback`,
                messageBody,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            // TODO: Remove this after testing in next release
            console.log("Feedback response: ", response);
            return response.data;
        } catch (error) {
            logger.error(`Error sending feedback: ${error}`);
            return { error: error };
        }
    };

}

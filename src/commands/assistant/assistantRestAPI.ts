import axios from "axios";
import * as vscode from "vscode";
import { logger } from "../../logger/logger";
import { AssistantResponse } from "./chat/types";

export class AssistantRestAPI {
    // Capella Prod domain
    private static ASSISTANT_URL_DOMAIN = "https://iq-fastapi.onrender.com";

    public static askAssistant = async (
        messageBody: string
    ): Promise<AssistantResponse> => {
        let result: AssistantResponse = {
            content: "",
            error: undefined,
            status: "",
            thread_id: "",
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
                result.content = content.data.content || "";
                result.thread_id = content.data.thread_id || "";
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

}

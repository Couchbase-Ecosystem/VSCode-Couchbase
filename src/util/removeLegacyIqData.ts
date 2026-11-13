import * as vscode from "vscode";
import { Constants } from "./constants";
import { logger } from "../logger/logger";

const IQ_CHAT_HISTORY_PREFIX = "vscode-couchbase.iq.allMessages.";

/**
 * Capella iQ was removed. Clears what it left on the user's machine: the saved login
 * (username, and the password in secret storage) and the saved iQ chat history.
 * Nothing the Couchbase Assistant uses is touched.
 */
export const removeLegacyIqData = async (globalState: vscode.Memento, secrets: vscode.SecretStorage): Promise<void> => {
    try {
        const savedUsername = globalState.get<string>(Constants.IQ_USER_ID);
        if (savedUsername) {
            await secrets.delete(`${Constants.IQ_PASSWORD}-${savedUsername}`);
            await globalState.update(Constants.IQ_USER_ID, undefined);
        }
        for (const key of globalState.keys()) {
            if (key.startsWith(IQ_CHAT_HISTORY_PREFIX)) {
                await globalState.update(key, undefined);
            }
        }
    } catch (err) {
        logger.error(`Failed to remove saved Capella iQ data: ${err}`);
    }
};

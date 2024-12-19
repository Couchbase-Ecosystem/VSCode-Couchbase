
import { Memory } from '../../../util/util';
import { Constants } from '../../../util/constants';
import { WebviewView } from 'vscode';

export const newChatHandler = () => {
    const iqWebview = Memory.state.get<WebviewView>(Constants.IQ_WEBVIEW);
    iqWebview?.webview.postMessage({
        command: "vscode-couchbase.iq.sendNewChatRequest"
    });
};

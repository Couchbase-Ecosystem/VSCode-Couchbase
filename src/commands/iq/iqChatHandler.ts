import { Memory } from "../../util/util";
import { iqRestApiService } from "./iqRestApiService";

export const iqChatHandler = async (requestPayload: any) => {
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    const result =  await iqRestApiService.sendIqMessage(jwtToken || "", "6af08c0a-8cab-4c1c-b257-b521575c16d0",requestPayload);
    return result;
};
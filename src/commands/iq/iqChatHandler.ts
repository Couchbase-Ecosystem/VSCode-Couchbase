import { Memory } from "../../util/util";
import { iqRestApiService } from "./iqRestApiService";

export const iqChatHandler = async (requestPayload: any, orgId: string) => {
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    const result =  await iqRestApiService.sendIqMessage(jwtToken || "", orgId,requestPayload);
    return result;
};
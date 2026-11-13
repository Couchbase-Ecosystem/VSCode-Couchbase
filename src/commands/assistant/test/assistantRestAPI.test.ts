import axios from "axios";
import { AssistantRestAPI } from "../assistantRestAPI";

jest.mock("vscode", () => require("./vscodeMock"));
jest.mock("axios");

const mockedPost = axios.post as jest.Mock;
const ASSISTANT_SERVER = "https://iq-fastapi.prod.cbdevx.com";

describe("AssistantRestAPI", () => {
    beforeEach(() => jest.clearAllMocks());

    it("asks the Assistant server and maps the reply", async () => {
        mockedPost.mockResolvedValue({ data: { content: "answer", thread_id: "t1", run_id: "r1" } });

        const result = await AssistantRestAPI.askAssistant('{"data":{}}');

        expect(mockedPost.mock.calls[0][0]).toBe(`${ASSISTANT_SERVER}/chat_postman`);
        expect(mockedPost.mock.calls[0][1]).toBe('{"data":{}}');
        expect(result).toEqual(expect.objectContaining({ content: "answer", threadId: "t1", runId: "r1", tool_args: null }));
    });

    it("passes tool requests through so the extension can answer them", async () => {
        mockedPost.mockResolvedValue({ data: { content: "", tool_args: { collection: "hotel" } } });

        const result = await AssistantRestAPI.askAssistant("{}");

        expect(result.tool_args).toEqual({ collection: "hotel" });
    });

    it("returns an error instead of throwing when the server fails", async () => {
        mockedPost.mockRejectedValue(new Error("network down"));

        const result = await AssistantRestAPI.askAssistant("{}");

        expect(result.error).toBeDefined();
    });

    it("restarts a conversation on the Assistant server", async () => {
        mockedPost.mockResolvedValue({ data: { ok: true } });

        await AssistantRestAPI.restartAssistant("{}");

        expect(mockedPost.mock.calls[0][0]).toBe(`${ASSISTANT_SERVER}/restart_postman`);
    });

    it("sends feedback to the Assistant server", async () => {
        mockedPost.mockResolvedValue({ data: { ok: true } });

        await AssistantRestAPI.sendFeedback("{}");

        expect(mockedPost.mock.calls[0][0]).toBe(`${ASSISTANT_SERVER}/docs/feedback`);
    });
});

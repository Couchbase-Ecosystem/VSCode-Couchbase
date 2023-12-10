import axios from "axios";
import https from 'https';
import { logger } from "../../logger/logger";

export class iqRestApiService {

    private static readonly SESSIONS_API_URL = "https://api.dev.nonprod-project-avengers.com/sessions";
    private static readonly FETCH_ORGANIZATIONS_URL = "https://api.dev.nonprod-project-avengers.com/v2/organizations";

    public static capellaLogin = async (username: string, password: string) => {
        let content = await axios.post(this.SESSIONS_API_URL, {}, {
            auth: {
                username: username,
                password: password
            }
        });
        return content.data.jwt;
    };

    public static loadOrganizations = async (jwt: string) => {
        let content = await axios.get(this.FETCH_ORGANIZATIONS_URL, {
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        });
        return content.data.data;
    };

    public static sendIqMessage = async (jwt: string, orgId: string, messageBody: any) => {
        let result = {
            content: "",
            error: "",
            status: ""
        };

        try {
            let content = await axios.post("https://api.dev.nonprod-project-avengers.com/v2/organizations/" + orgId + "/integrations/iq/openai/chat/completions",
                messageBody,
                {
                    headers: {
                        Authorization: "Bearer " + jwt,
                        "Content-Type": "application/json",
                        Connection: "keep-alive"
                    },

                },
            );
            result.content = content.data.choices[0].message.content;
            result.status = content.status.toString();
        }
        catch (error: any) {
            if (error.response && error.response.status === 401) {
                result.error = "The current session has expired, Please login again";
                result.status = "401";
            } else if(error.response){
                result.error = error.response;
                result.status = error.response.status.toString();
            }
            else {
                logger.error("Error while receiving message from IQ: " + error);
                result.error = "Error while receiving message from IQ: " + error;
            }
        }
        return result;
    };
}
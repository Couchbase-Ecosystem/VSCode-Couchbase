import axios from "axios";
import https from 'https';

export class iqRestApiService {

    private static readonly SESSIONS_API_URL = "https://api.dev.nonprod-project-avengers.com/sessions";
    private static readonly FETCH_ORGANIZATIONS_URL = "https://api.dev.nonprod-project-avengers.com/v2/organizations";

    public static capellaLogin = async (username: string, password: string) => {
        let content = await axios.post(this.SESSIONS_API_URL, {},{
            auth: {
                username: username,
                password: password
            }
        });
        console.log(content.data.jwt);
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
}
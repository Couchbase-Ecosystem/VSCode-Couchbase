import axios from "axios";
import https from 'https';

export class iqRestApiService {

    private static readonly SESSIONS_API_URL = "https://api.dev.nonprod-project-avengers.com/sessions";

    public static capellaLogin = async (username: string, password: string) => {
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        console.log(btoa(`${username}:${password}`));
        let content = await axios.post(this.SESSIONS_API_URL, {},{
            auth: {
                username: username,
                password: password
            }
        });
        console.log(content.data.jwt);
    }
}
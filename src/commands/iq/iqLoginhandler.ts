import { iqRestApiService } from "./iqRestApiService";

interface IFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}


/*  
TODO's:
    1. Get session key token
    2. check iq availability once using a dummy rest api
    3. Return with session data. Maybe handle a way to 
*/

const getSessionsKey = (formData: IFormData) => {
    iqRestApiService.capellaLogin(formData.username, formData.password);
}

export const iqLoginHandler = (formData: IFormData) => {
    getSessionsKey(formData);
};
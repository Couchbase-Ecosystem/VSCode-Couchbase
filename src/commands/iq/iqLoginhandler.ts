import { Constants } from "../../util/constants";
import { Global, Memory } from "../../util/util";
import { iqRestApiService } from "./iqRestApiService";
import * as keytar from "keytar";

interface IFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface ISavedLoginDataGetter {
    doesLoginDetailsExists: boolean;
    username: string;
}

const getSessionsJwt = async (formData: IFormData): Promise<string> => {
    try {
        return await iqRestApiService.capellaLogin(
            formData.username,
            formData.password
        );
    } catch (error: any) {
        throw new Error(error.message.toString());
    }
};

export const iqLoginHandler = async (formData: IFormData) => {
    try {
        // Check for remember me
        if (formData.rememberMe === true) {
            Global.state.update(Constants.IQ_USER_ID, formData.username);
            keytar.setPassword(
                Constants.IQ_PASSWORD,
                formData.username,
                formData.password
            );
        }

        // Return organization select page data
        const jwtToken = await getSessionsJwt(formData);
        Memory.state.update("vscode-couchbase.iq.jwtToken", jwtToken);
        const organizations = await iqRestApiService.loadOrganizations(
            jwtToken
        );
        return organizations;
    } catch (error: any) {
        throw new Error(error.message.toString());
    }
};

export const iqSavedLoginDataGetter =
    async (): Promise<ISavedLoginDataGetter> => {
        const username = Global.state.get<string>(Constants.IQ_USER_ID);
        if (username && username !== "") {
            // Username exists, sending it back to webview
            return {
                doesLoginDetailsExists: true,
                username: username,
            };
        } else {
            return {
                doesLoginDetailsExists: false,
                username: "",
            };
        }
    };

export const iqSavedLoginHandler = async (username: string) => {
    try {
        const password = await keytar.getPassword(
            Constants.IQ_PASSWORD,
            username
        );
        if (password) {
            // Return organization select page data
            const jwtToken = await getSessionsJwt({
                username: username,
                password: password,
                rememberMe: true,
            });
            Memory.state.update("vscode-couchbase.iq.jwtToken", jwtToken);
            const organizations = await iqRestApiService.loadOrganizations(
                jwtToken
            );
            return organizations;
        } else {
            return undefined;
        }
    } catch (error: any) {
        throw new Error(error.message.toString());
    }
};

export const handleIqSupplementalTerms = async (
    orgDetails: any
): Promise<any> => {
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    if (jwtToken === undefined) {
        return {
            isOrgVerified: false,
            errorMessage: "",
        };
    }
    if (!orgDetails.iq.other) {
        orgDetails.iq.other = {};
    }
    // Set the isTermsAcceptedForOrg to True
    orgDetails.iq.other.isTermsAcceptedForOrg = true;
    const response = await iqRestApiService.acceptIqSupplementalTerms(
        jwtToken,
        orgDetails.id,
        orgDetails
    );
};

export const verifyOrganization = async (orgId: string): Promise<any> => {
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    if (jwtToken === undefined) {
        return {
            shouldAcceptIqTerms: false,
            isOrgVerified: false,
            errorMessage: "",
        };
    }
    const orgDetails = await iqRestApiService.getOrganizationDetails(
        jwtToken,
        orgId
    );
    const userId = Memory.state.get<string>("vscode-couchbase.iq.userId");
    if (!orgDetails.iq || orgDetails.iq.enabled === false) {
        return {
            shouldAcceptIqTerms: false,
            isOrgVerified: false,
            errorMessage: `Capella iQ is not enabled for this organization, Please enable it on cloud.couchbase.com`,
        };
    }
    if (
        !orgDetails.iq.other ||
        orgDetails.iq.other.isTermsAcceptedForOrg === false
    ) {
        // Allow to Accept Terms ONLY if user is org owner
        if (
            (orgDetails.createdByUserID &&
                orgDetails.createdByUserID === userId) ||
            (orgDetails.modifiedByUserID &&
                orgDetails.modifiedByUserID === userId)
        ) {
            return {
                shouldAcceptIqTerms: true,
                isOrgVerified: false,
                errorMessage: `Capella iQ uses a third-party large language model (LLM). Please do not enter sensitive data into iQ and review its output before using.  `,
            };
        } else {
            return {
                shouldAcceptIqTerms: false,
                isOrgVerified: false,
                errorMessage: `Capella iQ Supplemental Terms have not yet been accepted. To continue, kindly request the organization owner to review and agree to the terms and conditions. `,
            };
        }
    }
    return {
        shouldAcceptIqTerms: false,
        isOrgVerified: true,
        errorMessage: "",
    };
};

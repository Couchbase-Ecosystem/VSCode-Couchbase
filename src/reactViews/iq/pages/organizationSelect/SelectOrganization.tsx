import Dropdown from "components/inputs/dropdown/Dropdown";
import IqChat from "pages/chatscreen/IqChat";
import { useState } from "react";

const SelectOrganizationPage = ({ organizationDetails, setShowPage }) => {
    const [selectedOrg, setSelectedOrg] = useState(undefined);
    const [rememberOrgCheckbox, setRememberOrgCheckbox] = useState(false);
    const handleOrgClick = (org) => {
        setSelectedOrg(org);
    };

    const handleRememberOrgCheckbox = (event) => {
        setRememberOrgCheckbox(event.target.checked);
    };

    const handleSubmit = () => {
        if (selectedOrg !== undefined) {
            if (rememberOrgCheckbox) {
                // Here if user has asked to remember the org, then we store it inside settings
                tsvscode.postMessage({
                    command: "vscode-couchbase.iq.rememberOrganization",
                    value: {
                        organizationDetails: selectedOrg
                    }
                });
            }
            // At the end, we shift to next page that is main iq chat
            setShowPage(<IqChat org={selectedOrg} />);
        }
    };
    return (
        <div>
            <Dropdown
                trigger={<button>Dropdown</button>}
                menu={organizationDetails.map((org) => {
                    return (
                        <button onClick={() => handleOrgClick(org)}>
                            {org.data.name}
                        </button>
                    );
                })}
            />
            <div>
                <label>Remember the organization</label>
                <input
                    type="checkbox"
                    id="rememberOrg"
                    onClick={(event) => handleRememberOrgCheckbox(event)}
                />
            </div>
            <button
                className="redButton"
                onClick={() => handleSubmit()}
            >Submit</button>
        </div>
    );
};

export default SelectOrganizationPage;

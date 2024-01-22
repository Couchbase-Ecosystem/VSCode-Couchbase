import Dropdown from "components/inputs/dropdown/Dropdown";
import IqChat from "pages/chatscreen/IqChat";
import { useEffect, useState } from "react";
import "./SelectOrganization.scss";

const SelectOrganizationPage = ({ organizationDetails, setShowPage, setIsLoading }) => {
  const [selectedOrg, setSelectedOrg] = useState(undefined);
  const [rememberOrgChecked, setRememberOrgChecked] = useState(false);
  
  const handleOrgClick = (org) => {
    setSelectedOrg(org);
  };

  const handleRememberOrgCheckbox = () => {
    setRememberOrgChecked(!rememberOrgChecked);
  };

  const handleSubmit = () => {
    if (selectedOrg !== undefined) {
      setIsLoading(true);
      // Verify if organization is allowed
      tsvscode.postMessage({
        command: "vscode-couchbase.iq.verifyOrganizationAndSave",
        value: {
          organizationDetails: selectedOrg,
          rememberOrgChecked: rememberOrgChecked
        }
      });
      // At the end, we shift to next page that is main iq chat
      setShowPage(<IqChat org={selectedOrg} setIsLoading={setIsLoading} />);
    }
  };

  useEffect(() => {
    setIsLoading(false);
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showLogoutButton",
      value: {
        enabled: true
      }
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showNewChatButton",
      value: {
        enabled: false
      }
    });
  }, []);
  
  return (
    <div className="selectOrganizationContainer">
      <h1>Select an organization</h1>
      <Dropdown
        triggerName="Select Organization"
        menu={organizationDetails.map((org) => {
          return (
            <button onClick={() => handleOrgClick(org)}>{org.data.name}</button>
          );
        })}
      />
      <div onClick={() => handleRememberOrgCheckbox()}>
        <input type="checkbox" id="rememberOrg" checked={rememberOrgChecked}/>
        <label>Remember the organization</label>
      </div>
      <p>
        {" "}
        Notes:
        <li>Please only select an organization where iQ is enabled.</li>
        <li>
          If you remember the organization, it will set it as default for future
          logins. you can change default in settings.
        </li>
      </p>
      <button className="redButton" onClick={() => handleSubmit()}>
        Submit
      </button>
    </div>
  );
};

export default SelectOrganizationPage;

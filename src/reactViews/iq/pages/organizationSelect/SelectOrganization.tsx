import Dropdown from "components/inputs/dropdown/Dropdown";
import IqChat from "pages/chatscreen/IqChat";

const SelectOrganizationPage = ({ organizationDetails, setShowPage }) => {
    const handleOrgClick = (org) => {
        setShowPage(<IqChat org={org} />);
    };
    console.log(organizationDetails);
    return (
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
    );
};

export default SelectOrganizationPage;

import Dropdown from "components/inputs/dropdown/Dropdown";

const handleOrgClick = (org) => {
    console.log("clicked ", org);
};

const SelectOrganizationPage = (organizationDetails) => {
    console.log(organizationDetails);
    return (
        <Dropdown
            trigger={<button>Dropdown</button>}
            menu={organizationDetails.organizationDetails.map((org) => {
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

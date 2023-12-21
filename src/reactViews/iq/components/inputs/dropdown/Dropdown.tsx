import { cloneElement, useState } from "react";
import "./dropdown.scss";

const Dropdown = ({ triggerName, menu, className="" }) => {
    const [open, setOpen] = useState(false);
    
    const [triggerText, setTriggerText] = useState(triggerName);

    const handleOpen = () => {
      setOpen(!open);
    };


    
    return (
      <div className="dropdown">
        <button  onClick= {handleOpen} className="dropdown-trigger ${open ? 'open' : ''}">
          <span>{triggerText}</span>
          <i className="caret-icon" />
        </button>
        {open ? (
          <ul className="menu">
            {menu.map((menuItem, index) => (
              <li key={index} className="menu-item">
                {cloneElement(menuItem, {
                  onClick: () => {
                    setTriggerText(menuItem.props.children);
                    menuItem.props.onClick();
                    setOpen(false);
                  },
                })}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

export default Dropdown;
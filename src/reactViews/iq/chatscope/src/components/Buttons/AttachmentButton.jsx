import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { prefix } from "../settings";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";

export const AttachmentButton = ({ className, children, icon={faPaperclip}, ...rest }) => {
  const cName = `${prefix}-button--attachment`;

  return (
    <Button
      {...rest}
      className={classNames(cName, className)}
      icon={<FontAwesomeIcon icon={icon} />}
      
    >
      {children}
    </Button>
  );
};

AttachmentButton.propTypes = {
  /** Primary content. */
  children: PropTypes.node,

  /** Additional classes. */
  className: PropTypes.string,
};

AttachmentButton.defaultProps = {
  className: "",
};

export default AttachmentButton;

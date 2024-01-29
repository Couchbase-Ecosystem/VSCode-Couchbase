import { ModalWithTextBox } from "components/modals/ModalWithTextBox";

export const SendFeedback = ({ isOpen, onSubmit, onClose }) => {
  return (
    <ModalWithTextBox
      isOpen={isOpen}
      onSubmit={onSubmit}
      onClose={onClose}
      label="Enter Feedback"
    />
  );
};

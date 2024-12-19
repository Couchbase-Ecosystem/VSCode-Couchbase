import "./ModalWithCancelButton.scss";

export function ModalWithCancelButton({ isOpen, onSubmit, onClose, content}) {

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(); // Pass the entered text to the parent component
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-container" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-content-area">
        <form onSubmit={handleSubmit}>
        <p className="content-msg">{content}</p>
          <div className="button-container">
            <button type="submit">Yes</button>
            <button type="button" onClick={handleClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

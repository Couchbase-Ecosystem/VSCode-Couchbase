import "./Modal.scss";

export function Modal({isOpen, onClose, content }) {
  return (
    <div className="modal-container" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-content-area">
        <p className="content-msg">{content}</p>
        <div className="button-container">
          <button type="submit" onClick={onClose}>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import "./ModalWithTextBox.scss";

export function ModalWithTextBox({ isOpen, onSubmit, onClose, label = "Enter text" }) {
  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if(text.trim() === "") {
      return;
    }
    onSubmit(text); // Pass the entered text to the parent component
    handleClose();
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <div className="modal-container" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <label htmlFor="text">{label}:</label>
          <textarea
            id="text"
            value={text}
            onChange={handleChange}
          />
          <div className="button-container">
            <button type="submit">Submit</button>
            <button type="button" onClick={handleClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

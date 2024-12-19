import { useState } from 'react';
import "./Modal.scss";

export function ModaliQTerm({ isOpen, onClose, content, onAccept }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleClose = () => {
    if (isChecked) {
      onAccept();
    } else {
      alert("You must accept the terms and conditions to proceed.");
    }
  };

  return (
    <div className="modal-container" style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-content-area">
      <button 
        className="modal-close-btn" 
        onClick={onClose}>
        X
      </button>
      <h2 className="modal-header">Accept Capella iQ Supplemental Terms</h2>
        <p className="content-msg">{content}</p>
        {/* Checkbox for accepting Capella iQ Terms */}
        <div className="terms-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
              I have read and agree to the <a href="https://www.couchbase.com/iQ-terms/"> Capella IQ Supplemental terms</a>
          </label>
        </div>
        <div className="button-container">
          <button type="submit" onClick={handleClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

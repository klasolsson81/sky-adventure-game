import PropTypes from 'prop-types';

/**
 * Reusable Modal Component
 * Displays overlay with centered content
 *
 * FIX #12: Extracted from duplicate code in App.jsx
 * Used for rotate overlay and fullscreen warning
 */
function Modal({ isOpen, icon, title, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${className}`}>
      <div className="modal-content">
        {icon && <div className="modal-icon">{icon}</div>}
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;

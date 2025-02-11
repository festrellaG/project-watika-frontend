import closePopup from "../../images/close_icon.png";
import "./PopupWithForm.css";

function PopupWithForm(props) {
  return (
    <div
      className={`popup popup_type_${props.name} ${
        props.isOpen ? "popup_generate" : ""
      }`}
    >
      <div className={`popup__container popup__form popup_type_${props.name}`}>
        <button onClick={props.onClose}>
          <img
            src={closePopup}
            className="popup__close"
            alt="icono en tache para cerrar form"
          />
        </button>
        <h1 className="popup__title">{props.title}</h1>
        <div>{props.children}</div>
      </div>
    </div>
  );
}

export default PopupWithForm;

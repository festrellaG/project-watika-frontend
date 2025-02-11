import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Utils/CalendarCustom.css";
import PopupWithForm from "../PopupWithForm/PopupWithForm";
import "./Form.css";
import iconError from "../../images/iconError.png";
import successIcon from "../../images/iconSuccess.png";
import Calendar from "react-calendar";
import { format } from "date-fns";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Utils/Firebase";

/*import "react-calendar/dist/Calendar.css";*/

function Form() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [file, setFile] = useState(null);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [enabledDates, setEnabledDates] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showErrorSubmit, setShowErrorSubmit] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();
  const { service } = location.state || {};

  useEffect(() => {
    const fetchEnabledDates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "addEnableDates"));
        const dates = querySnapshot.docs
          .map((doc) => ({
            ...doc.data(),
          }))
          .filter((date) => date.numberBooking > 0)
          .filter((date) => date.service === service.title)
          .map((date) => new Date(date.fullYear, date.month, date.date));

        setEnabledDates(dates);
      } catch (error) {
        console.error("Error fetching enabled dates:", error);
      }
    };

    fetchEnabledDates();
  }, []);

  function handleChangeName(e) {
    setName(e.target.value);
  }

  function handleChangeEmail(e) {
    setEmail(e.target.value);
  }

  function handleChangePhone(e) {
    setPhone(e.target.value);
  }

  function handleChangeAddress(e) {
    setAddress(e.target.value);
  }

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleInputClickDate = () => {
    setShowCalendar(true);
  };

  const closePopupDate = () => {
    setShowCalendar(false);
  };

  const handleInputClickBankDetails = () => {
    setShowBankDetails(true);
  };

  const closePopupBankDetails = () => {
    setShowBankDetails(false);
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const isEnabled = enabledDates.some(
        (enabledDate) =>
          date.getDate() === enabledDate.getDate() &&
          date.getMonth() === enabledDate.getMonth() &&
          date.getFullYear() === enabledDate.getFullYear()
      );
      return !isEnabled;
    }
    return false;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name) {
      setFile(selectedFile);
      // Simulación de carga de archivo
    }
  };

  const generateRegistrationNumber = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${random}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setShowErrorSubmit(false);

    // carga de imagen en Storage de Firebase
    const uploadImageToStorage = async (imageFile, imageName) => {
      const storageRef = ref(storage, `booking/${imageName}`);
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    };

    try {
      //Generar número de registro
      const newRegistrationNumber = generateRegistrationNumber();
      setRegistrationNumber(newRegistrationNumber);

      // Valida campos requeridos
      if (
        !service?.title ||
        !selectedDate ||
        !name ||
        !email ||
        !phone ||
        !file
      ) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      // Formatear fechas
      let dateFormat = format(selectedDate, "dd/MM/yyyy");
      let createdAt = format(new Date(), "dd/MM/yyyy");

      // Agrega nuevo documento en la colleccion "booking"
      await setDoc(doc(db, "booking", newRegistrationNumber), {
        service: service.title,
        date: dateFormat,
        name,
        email,
        phone,
        address,
        file: await uploadImageToStorage(file, file.name),
        createdAt: createdAt,
        registrationNumber: newRegistrationNumber,
      });

      //Obtiene la fecha seleccionada en el calendario
      const dayOfMonth = selectedDate.getDate();
      const monthOfYear = selectedDate.getMonth();
      const fullYear = selectedDate.getFullYear();

      // Query
      const q = query(
        collection(db, "addEnableDates"),
        where("date", "==", dayOfMonth),
        where("month", "==", monthOfYear),
        where("fullYear", "==", fullYear)
      );

      // Obtiene el documento en la colección "addEnableDates"
      const querySnapshot = await getDocs(q);

      // Actualiza el número de reservaciones
      querySnapshot.forEach(async (document) => {
        const docRef = doc(db, "addEnableDates", document.id);
        const currentBookings = document.data().numberBooking;

        // Actualiza numberBooking
        await updateDoc(docRef, {
          numberBooking: currentBookings - 1,
        });
      });

      //Muestra popup de exito y liga de whatsapp
      setShowSaveForm(true);
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      setShowErrorSubmit(true);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePopupSaveForm = () => {
    setShowSaveForm(false);
    navigate("/");
  };

  const closePopupErrorSubmit = () => {
    setShowErrorSubmit(false);
  };

  return (
    <section id="form-section">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__container">
          <h3 className="form__title">{service?.title || ""}</h3>
          <p>Costo: $ {service?.cost || ""}</p>
          <img
            src={service.image || ""}
            alt={service?.title || ""}
            className="form__card-image"
          />
          <p className="form__description">{service?.description || ""}</p>
        </div>
        <fieldset className="form__input-content">
          <div className="form__section-content">
            <label htmlFor="name" className="form__label">
              Fecha Evento:
            </label>
            <div className="form__date-container">
              <input
                type="text"
                className="form__item form__item_date"
                id="date"
                name="date"
                placeholder="Selecciona una fecha"
                value={selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}
                onClick={handleInputClickDate}
                readOnly
                required
              />
            </div>
          </div>
          <div className="form__section-content">
            <label htmlFor="name" className="form__label">
              Nombre:
            </label>
            <input
              type="text"
              className="form__item"
              id="name"
              minLength="2"
              maxLength="50"
              name="name"
              placeholder="Nombre Apellido"
              value={name}
              onChange={handleChangeName}
              required
            />
          </div>
          <div className="form__section-content">
            <label htmlFor="form-email" className="form__label">
              Correo:
            </label>
            <input
              type="email"
              className="form__item"
              id="form-email"
              name="form-email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={handleChangeEmail}
              required
            />
          </div>
          <div className="form__section-content">
            <label htmlFor="form-phone" className="form__label">
              Telefono:
            </label>
            <input
              type="number"
              className="form__item"
              id="form-phone"
              name="form-phone"
              placeholder="1234567890"
              value={phone}
              onChange={handleChangePhone}
              required
            />
          </div>
          <div className="form__section-content">
            <label htmlFor="form-address" className="form__label">
              Dirección:
            </label>
            <input
              type="text"
              className="form__item"
              id="form-address"
              minLength="2"
              maxLength="100"
              name="form-address"
              placeholder="Avenida, Calle, Número"
              value={address}
              onChange={handleChangeAddress}
              required
            />
          </div>

          <div className="form__section-content">
            <label htmlFor="bank-details" className="form__label">
              Datos Bancarios:
            </label>
            <button
              type="button"
              className="form__button form__button_bank-details"
              onClick={handleInputClickBankDetails}
              id="bank-details"
            >
              <p>Da click! para ver los datos bancarios</p>
            </button>
          </div>
          <div className="form__file-wrapper">
            <label htmlFor="file-upload" className="form__label_file">
              Sube tu comprobante de pago:
            </label>
            <input
              type="file"
              className="form__item_file"
              id="file-upload"
              name="file-upload"
              accept=".png, .jpg, .jpeg, .svg, .pdf"
              onChange={handleFileChange}
              required
            />

            {file && <span className="form__file-name">{file.name}</span>}
          </div>
          <div className="form__button-container">
            <button className="form__button">Guardar Reserva</button>
          </div>
        </fieldset>
      </form>
      {showCalendar && (
        <PopupWithForm
          isOpen={showCalendar}
          onClose={closePopupDate}
          name="popupCalendar"
        >
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileDisabled={tileDisabled}
          />
        </PopupWithForm>
      )}

      {showBankDetails && (
        <PopupWithForm
          isOpen={showBankDetails}
          onClose={closePopupBankDetails}
          name="popupBankDetails"
        >
          <div className="form__description-content">
            <p>Banco: Bancomer</p>
            <p>Nombre: Alejandra Esponda Batista</p>
            <p>Cuenta: 1411206796</p>
            <p>Clabe: 012180014112067961</p>
            <p>Tarjeta: 4152314048597218</p>
            <p>Concepto: "Ceremonia," "Nombre"</p>
            <p>Ejemplo: "Ceremonia Ayahuasca, Roberto Juárez" </p>
            <p>Sube el comprobante de pago</p>
          </div>
        </PopupWithForm>
      )}

      {showSaveForm && (
        <PopupWithForm
          isOpen={showSaveForm}
          onClose={closePopupSaveForm}
          name="popupSaveForm"
        >
          <div>
            <img src={successIcon} alt="Icono de exitoso" width={50} />
            <p>Tu lugar y pago han sido registrados correctamente.!</p>
            <p>
              Favor de mandar whatsapp con tu número de registro:
              {registrationNumber}.
            </p>
            <p>
              al número{" "}
              <a
                href={`https://wa.me/525520672790?text=Hola,%20mi%20número%20de%20registro%20es:%20${registrationNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="form__whatsapp-link"
              >
                5549289671
              </a>{" "}
              con Alejandra Esponda.
            </p>
          </div>
        </PopupWithForm>
      )}
      {!isSubmitting && (
        <PopupWithForm
          isOpen={showErrorSubmit}
          onClose={closePopupErrorSubmit}
          name="popupErrorSubmit"
        >
          <div className="form__error">
            {submitError && (
              <img src={iconError} alt="Icono de error" width={50} />
            )}
            <p>{submitError}</p>
          </div>
        </PopupWithForm>
      )}
    </section>
  );
}

export default Form;

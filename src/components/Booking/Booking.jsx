import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "../Utils/Firebase";
import { ref, getDownloadURL } from "firebase/storage";
import "./Booking.css";

function Reserva() {
  const [slidesCards, setSlidesCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const slidesData = await Promise.all(
          // Esperar a que todas las promesas se resuelvan
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Descargar la imagen desde la URL
            const imageRef = ref(storage, data.image);
            const image = await getDownloadURL(imageRef);

            return {
              id: doc.id,
              ...data,
              image: image, // Actualizar la URL con la URL descargada
            };
          })
        );
        setSlidesCards(slidesData);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleServiceClick = (card) => {
    navigate("/form", { state: { service: card } });
  };

  let content;

  if (isLoading) {
    content = <div>Cargando...</div>;
  } else if (slidesCards.length > 0) {
    content = (
      <div className="booking">
        <h1 className="booking__title">Reservas</h1>
        <p className="booking__text">
          Aquí puedes reservar una ceremonia, círculo o terapia. ¡Esperamos
          verte pronto!
        </p>
        <ul className="booking__cards">
          {slidesCards.map((card) => (
            <li key={card.title} className="booking__card">
              <button
                onClick={() => handleServiceClick(card)}
                className="booking__card-button"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="booking__card-image"
                />
              </button>
              <h2 className="booking__card-title">{card.title}</h2>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    content = <div>No hay noticias disponibles</div>;
  }
  return <section>{content}</section>;
}

export default Reserva;

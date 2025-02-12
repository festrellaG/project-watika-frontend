import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "../Utils/Firebase";
import { ref, getDownloadURL } from "firebase/storage";
import "./Main.css";

function Main() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "slides"));
        const slidesData = await Promise.all(
          // Esperar a que todas las promesas se resuelvan
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Descargar la imagen desde la URL
            const imageRef = ref(storage, data.imageUrl);
            const imageUrl = await getDownloadURL(imageRef);

            return {
              id: doc.id,
              ...data,
              imageUrl: imageUrl, // Actualizar la URL con la URL descargada
            };
          })
        );
        setSlides(slidesData);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    // Reset currentSlide when slides array changes
    if (slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  let content;

  if (isLoading) {
    content = <div>Cargando...</div>;
  } else if (slides.length > 0) {
    content = (
      <div className="main__content">
        <h2 className="main__title">¡Últimas noticias en Watika!</h2>
        <section>
          <div className="main__slider">
            <button className="main__slider-arrow" onClick={prevSlide}>
              &#8592;
            </button>

            <img
              src={slides[currentSlide].imageUrl}
              alt={slides[currentSlide].title}
              className="main__slider-image"
            />

            <button className="main__slider-arrow" onClick={nextSlide}>
              &#8594;
            </button>
          </div>
          <div className="main__slider-info">
            <h3 className="main__slider-title">{slides[currentSlide].title}</h3>
            <p className="main__slider-description">
              {slides[currentSlide].description}
            </p>
          </div>
        </section>
      </div>
    );
  } else {
    content = <div>No hay noticias disponibles</div>;
  }

  return <main className="main">{content}</main>;
}

export default Main;

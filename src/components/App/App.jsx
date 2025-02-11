import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import Booking from "../Booking/Booking";
import Form from "../Form/Form";

function App() {
  return (
    <div className="page">
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/form" element={<Form />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

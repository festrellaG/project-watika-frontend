import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imageLogo from "../../images/watika-logo-small.png";
import "./Header.css";

function Header() {
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveItem("Inicio");
  }, []);

  const menuItems = [
    { name: "Inicio", path: "/" },
    { name: "Reservas", path: "/booking" },
  ];

  const handleNavigation = (item) => {
    setActiveItem(item.name);
    if (item.action) {
      item.action();
    } else {
      navigate(item.path);
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <img
          src={imageLogo}
          alt="Logototipo de una Página iteractiva"
          className="header__logo"
          id="image-logo"
        />
        <nav className="header__nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`header__nav-item ${
                activeItem === item.name ? "header__nav-item_active" : ""
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;

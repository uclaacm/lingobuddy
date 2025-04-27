import { useState } from 'react';
import { FaMicrophone } from "react-icons/fa";
import './lesson.css';

export default function RotatingButton() {
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = () => {
    setIsRotating(!isRotating);
  };

  return (
    <div className="button-container">
      <button
        className={`microphone-btn${isRotating ? ' rotating-border' : ''}`}
        onClick={handleClick}
      >
        <FaMicrophone />
      </button>
    </div>
  );
} 
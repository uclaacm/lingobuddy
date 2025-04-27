import { useState } from 'react';
import { FaMicrophone } from "react-icons/fa";
import './lesson.css';

export default function RotatingButton() {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    setIsPulsing(!isPulsing);
  };

  return (
    <div className="button-container">
      <button
        className={`microphone-btn${isPulsing ? ' active' : ''}`}
        onClick={handleClick}
      >
        <FaMicrophone size={40} />
      </button>
    </div>
  );
}
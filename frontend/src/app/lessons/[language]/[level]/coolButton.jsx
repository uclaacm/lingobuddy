import { useState } from 'react';
import { FaMicrophone } from "react-icons/fa";
import './lesson.css';

export default function RotatingButton({ onMicClick }) {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    setIsPulsing(!isPulsing);
    if (onMicClick) {
      onMicClick();
    }
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
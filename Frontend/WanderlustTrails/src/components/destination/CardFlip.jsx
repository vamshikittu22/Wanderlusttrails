//path: Frontend/WanderlustTrails/src/components/destination/CardFlip.jsx
import React, { useState } from 'react';

const CardFlip = ({ frontContent, backContent }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="relative w-full h-full" onClick={handleClick}>
            <div className={`absolute w-full h-full transition-transform duration-500 ease-in-out transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                {frontContent}
            </div>
            <div className={`absolute w-full h-full transition-transform duration-500 ease-in-out transform ${isFlipped ? '' : 'rotate-y-180'}`}>
                {backContent}
            </div>
        </div>
    );
};

export default CardFlip;


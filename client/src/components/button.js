// client/src/components/Button.js
import React from 'react';
import '../App.css'; 

const Button = ({ label, onClick, icon, className, type = "button" }) => {
    return (
        <button 
            type={type} 
            className={className}
            onClick={onClick}
        >
            {icon && <img src={icon} alt="icon" className="btn-icon" />}
            
            {label}
        </button>
    );
};

export default Button;
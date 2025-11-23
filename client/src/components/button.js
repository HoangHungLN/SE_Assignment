// client/src/components/Button.js
import React from 'react';
import '../App.css'; // Import CSS để nút bấm hiểu giao diện

// Component này nhận vào các "tham số" (props) để biến hình:
// - label: Chữ hiển thị trên nút
// - onClick: Hàm xử lý khi bấm
// - icon: Hình ảnh logo (nếu có)
// - className: Để chỉnh màu (xanh nhạt hay xanh ngọc)
const Button = ({ label, onClick, icon, className, type = "button" }) => {
    return (
        <button 
            type={type} 
            className={className} // Nhận class từ bên ngoài truyền vào (btn-hcmut hoặc btn-admin)
            onClick={onClick}
        >
            {/* Nếu có icon thì mới hiện thẻ img */}
            {icon && <img src={icon} alt="icon" className="btn-icon" />}
            
            {label}
        </button>
    );
};

export default Button;
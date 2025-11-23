import React from 'react';
import MainLayout from '../../components/MainLayout';

const GenericPage = ({ role, title }) => {
    return (
        <MainLayout role={role}>
            <div style={{ 
                padding: '40px', 
                margin: '50px auto', 
                maxWidth: '600px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: '#0066b3', marginBottom: '10px' }}>{title}</h2>
                <p style={{ color: '#666' }}>🚧 Chức năng đang được phát triển...</p>
                <button style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#e0e0e0',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }} onClick={() => window.history.back()}>Quay lại</button>
            </div>
        </MainLayout>
    );
};

export default GenericPage;
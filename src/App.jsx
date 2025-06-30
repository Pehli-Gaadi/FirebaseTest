import React, { useState } from 'react';
import { Button } from '@mui/material';
import PhoneAuth from './components/PhoneAuth';
import './App.css';

function App() {
  const [openAuth, setOpenAuth] = useState(false);

  const handleAuthSuccess = () => {
    setOpenAuth(false);
    // Handle successful authentication here
    console.log('Successfully authenticated!');
  };

  return (
    <div className="App">
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenAuth(true)}
        style={{ margin: '20px' }}
      >
        Login with Phone
      </Button>

      <PhoneAuth 
        open={openAuth} 
        onClose={(success) => {
          setOpenAuth(false);
          if (success) handleAuthSuccess();
        }} 
      />
    </div>
  );
}

export default App;

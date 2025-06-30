import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Box } from "@mui/material";
import PhoneAuth from "./components/PhoneAuth";
import TokenExpiryTimer from "./components/TokenExpiryTimer";
import { removeTokens } from "./utils/storeToken";
import { logout } from "./redux/login/loginSlice";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const [openAuth, setOpenAuth] = useState(false);

  const handleAuthSuccess = () => {
    setOpenAuth(false);
    console.log("Successfully authenticated!");
  };

  const handleLogout = () => {
    removeTokens();
    dispatch(logout());
  };

  return (
    <div className="App">
      <TokenExpiryTimer />

      <Box display="flex" gap={2} justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAuth(true)}
          style={{ margin: "20px" }}
        >
          Login with Phone
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          style={{ margin: "20px" }}
        >
          Logout
        </Button>
      </Box>

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

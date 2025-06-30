import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getTokens, removeTokens } from "../utils/storeToken";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/login/loginSlice";
import { refreshToken } from "../redux/login/loginService";

const TokenExpiryTimer = () => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState("");
  const [showExpiryDialog, setShowExpiryDialog] = useState(false);

  // Move calculateTimeLeft outside useEffect for reusability
  const calculateTimeLeft = () => {
      const tokens = getTokens();
      
      if (!tokens?.accessToken) {
        console.log('No access token found');
        return "";
      }

      try {
        // First decrypt the token if it's encrypted
        const decodedToken = jwtDecode(tokens.accessToken);
        
        const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const difference = expiryTime - now;

        if (difference <= 0) {
          if (!showExpiryDialog) setShowExpiryDialog(true);
          return "Token Expired";
        }

        // Convert to hours, minutes, seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return `Token expires in: ${hours}h ${minutes}m ${seconds}s`;
      } catch (error) {
        console.error("Error decoding token:", error);
        return "Invalid token";
      }
    };

  useEffect(() => {
    // Initial calculation
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    // If token is already expired on mount, show dialog
    if (initialTimeLeft === "Token Expired") {
      setShowExpiryDialog(true);
    }

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Show dialog when token expires
      if (newTimeLeft === "Token Expired") {
        setShowExpiryDialog(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array since calculateTimeLeft is now in component scope

  const handleTokenRefresh = async () => {
    try {
      const result = await dispatch(refreshToken()).unwrap();
      if (result) {
        setShowExpiryDialog(false);
        // Start checking timer again
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        
        // If we still don't have valid time left after refresh, logout
        if (!newTimeLeft || newTimeLeft === "Token Expired") {
          console.log('Token still invalid after refresh');
          handleLogout();
          return;
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    removeTokens();
    dispatch(logout());
    setShowExpiryDialog(false);
  };

  if (!timeLeft) return null;

  return (
    <>
      <Dialog
        open={showExpiryDialog}
        onClose={() => setShowExpiryDialog(false)}
        aria-labelledby="token-expiry-dialog"
      >
        <DialogTitle id="token-expiry-dialog">Session Expired</DialogTitle>
        <DialogContent>
          <Typography>
            Your session has expired. Please login again to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleTokenRefresh} 
            color="primary" 
            variant="contained"
            style={{ marginRight: '8px' }}
          >
            Refresh Session
          </Button>
          <Button 
            onClick={handleLogout} 
            color="secondary" 
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenExpiryTimer;

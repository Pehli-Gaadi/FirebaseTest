import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getTokens, removeTokens } from "../utils/storeToken";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/login/loginSlice";

const TokenExpiryTimer = () => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState("");

  const [showExpiryDialog, setShowExpiryDialog] = useState(false);


  useEffect(() => {
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

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    removeTokens();
    dispatch(logout());
    setShowExpiryDialog(false);
  };

  if (!timeLeft) return null;

  return (
    <>
      <Box
        position="fixed"
        top={16}
        right={16}
        bgcolor="rgba(0, 0, 0, 0.8)"
        color="white"
        padding={1}
        borderRadius={1}
        zIndex={9999}
      >
        <Typography variant="body2">{timeLeft}</Typography>
      </Box>

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
          <Button onClick={handleLogout} color="primary" variant="contained">
            Login Again
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TokenExpiryTimer;

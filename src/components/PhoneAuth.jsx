
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserProfile } from '../redux/login/loginService';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';

const PhoneAuth = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const setupRecaptcha = async () => {
    try {
      // Always remove the existing container first
      const oldContainer = document.getElementById('recaptcha-container');
      if (oldContainer) {
        oldContainer.remove();
      }

      // Create a new container
      const newContainer = document.createElement('div');
      newContainer.id = 'recaptcha-container';
      document.body.appendChild(newContainer);

      // Clear any existing recaptcha instances
      if (window.recaptchaVerifier) {
        await window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Create new recaptcha verifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          window.recaptchaVerifier = null;
        }
      });

      // Render it immediately
      await verifier.render();
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw new Error('Failed to setup verification. Please try again.');
    }
  };

  const requestOtp = async () => {
    if (timer > 0) {
      setError('Please wait before requesting a new OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      const verifier = await setupRecaptcha();
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      
      setConfirmationResult(confirmation);
      setShowOtp(true);
      startResendTimer();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      console.error('Error sending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setError('');
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }

      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      
      // Get Firebase token
      const firebaseToken = await user.getIdToken();
      
      // Get user profile and store token
      const result = await dispatch(getUserProfile({
        uid: user.uid,
        firebaseToken
      })).unwrap();
      
      if (result) {
        onClose(true); // Close dialog with success
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', err);
    }
  };

  const startResendTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (timer > 0) {
      setError('Please wait before requesting a new OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setOtp('');

    try {
      // Always setup a fresh reCAPTCHA for resend
      const verifier = await setupRecaptcha();
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      
      setConfirmationResult(confirmation);
      startResendTimer();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
      console.error('Error resending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setOtp('');
    setShowOtp(false);
    setError('');
    setTimer(0);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    onClose(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Phone Authentication</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <div id="recaptcha-container" style={{ display: 'none' }} />
        
        {!showOtp ? (
          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            margin="normal"
          />
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Enter OTP"
              variant="outlined"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="normal"
              type="number"
            />
            {timer > 0 ? (
              <Typography variant="body2" color="textSecondary">
                Resend OTP in {timer}s
              </Typography>
            ) : (
              <Button 
                onClick={handleResend} 
                color="primary"
                disabled={isLoading || timer > 0}
              >
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </Button>
            )}
          </Box>
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button 
          onClick={showOtp ? verifyOtp : requestOtp} 
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : (showOtp ? 'Verify OTP' : 'Send OTP')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhoneAuth;

import { createSlice } from "@reduxjs/toolkit";
import { 
  getUserProfile,
  getDealerProfile, 
  createUserProfile, 
  updateUserProfile, 
  getUsers, 
  updateUser, 
  deleteUserProfile, 
  loginWithFirebaseToken, 
  sendRefreshToken,
  getDealerUserProfile,
  refreshToken
} from "./loginService";
import createTransform from "redux-persist/es/createTransform";

const initialState = {
  isAuth: false,
  isLoginPage: false,
  userInfo: null,
  isLoading: false,
  status: null,
  error: null,
  users: []
};

export const loginTransform = createTransform(
  // Transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    const { isLoginPage, ...rest } = inboundState; // Exclude isLoginPage key
    return rest;
  },
  // Transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  // Define which reducers this transform gets called for.
  { whitelist: ['login'] }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    setOpenLoginModal: (state, { payload }) => {
      state.isLoginPage = payload;
    },
    isLoggedIn: (state, { payload }) => {
      state.isAuth = true;
    },
    getUserInfo: (state, action) => {
      console.log('action', action);
      state.userInfo = action.payload;
    },
    logout: (state) => {
      console.log('Logging out, resetting state');
      state.isAuth = false;
      state.isLoginPage = false;
      state.userInfo = null;
      state.status = null;
      state.error = null;
    },
    updateLoginUserInfo: (state, action) => {
      state.isLoading = true;
      state.status = "loading";
      state.userInfo = action.payload.data;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refresh token cases
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.isAuth = true;
        // Update tokens but keep existing user info
        console.log('Token refresh successful');
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuth = false;
        state.userInfo = null;
        console.log('Token refresh failed:', action.payload);
      })

      .addCase(getUserProfile.fulfilled, (state, action) => {
        console.log('getUserProfile.fulfilled payload:', action.payload);
        state.isLoading = false;
        state.status = "succeeded";
        state.isAuth = true;
        state.userInfo = action.payload?.data || action.payload;
        console.log('Updated state:', { isAuth: state.isAuth, userInfo: state.userInfo });
      })

      .addCase(getDealerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDealerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getDealerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.userInfo = action.payload.data;
      })
      .addCase(getDealerUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDealerUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getDealerUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.userInfo = action.payload.data;
      })
      .addCase(createUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.userInfo = action.payload.data; // Adjust if needed based on response structure
      })

      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = "succeeded";
        state.userInfo = { ...state.userInfo, ...action.payload.data }; // Adjust if needed based on response structure
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = { ...state.userInfo, ...action.payload.data };
      })

      .addCase(deleteUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.status = "succeeded";
      })
      .addCase(deleteUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(loginWithFirebaseToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithFirebaseToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.userInfo = action.payload.data;
      })
      .addCase(loginWithFirebaseToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(sendRefreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendRefreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = { ...state.userInfo, token: action.payload.data };
      })
      .addCase(sendRefreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
  },
});

export const { setOpenLoginModal, isLoggedIn, getUserInfo, updateLoginUserInfo, logout } = loginSlice.actions;

export default loginSlice.reducer;
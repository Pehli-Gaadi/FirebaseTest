import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setTokens } from "../../utils/storeToken";

// get users
export const getUsers = createAsyncThunk(
    "login/getUsers",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/get?isDeleted=false`
            );

            return response.data;

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// get dealer user profile
export const getDealerUserProfile = createAsyncThunk(
    "user/getDealerUserProfile",
    async (uid, thunkAPI) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/dealerUsers/getByUid`, { "uid": uid }
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// get user profile and store token
export const getUserProfile = createAsyncThunk(
    "user/getUserProfile",
    async ({ uid, firebaseToken }, thunkAPI) => {
        try {
            // First get the user profile
            const userResponse = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/getByUid`, 
                { "uid": uid }
            );

            console.log("userResponse", userResponse)

            // If user exists, get the auth token
            if (userResponse.data) {
                const tokenResponse = await axios.post(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/user/auth/login`,
                    { firebaseToken }
                );

                console.log("tokenResponse1:", tokenResponse.data);

                // Store tokens in cookies if they exist
                const accessToken = tokenResponse.data?.accessToken;
                const refreshToken = tokenResponse.data?.refreshToken;

                console.log("Tokens to store:", { accessToken, refreshToken });

                if (accessToken) {
                    const result = setTokens(accessToken, refreshToken || null);
                    console.log("Token storage result:", result);
                } else {
                    console.error("No access token received from backend");
                }

                // Return combined data
                const responseData = {
                    ...userResponse.data,
                    token: accessToken,
                    refreshToken: refreshToken
                };
                console.log("Final response data:", responseData);
                return responseData;
            }

            return userResponse.data;
        } catch (error) {
            console.error("Error in getUserProfile:", error);
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// get user profile
export const getDealerProfile = createAsyncThunk(
    "user/getDealerProfile",
    async (pincode, thunkAPI) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/getNearByDealers/${pincode}`
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// create user profile
export const createUserProfile = createAsyncThunk(
    "user/createUserProfile",
    async (user, thunkAPI) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/create`, [user]
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// update by google verified
export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async (data, thunkAPI) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/update`, [
                data
            ]
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// update user
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (data, thunkAPI) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/update`,
                [data]
            );

            if (data.callback) {
                data.callback();
            }
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// delete user
export const deleteUserProfile = createAsyncThunk(
    "user/deleteUserProfile",
    async (data, thunkAPI) => {
        try {
            const deletedData = { "ids": [data] }
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/delete`, { data: deletedData });

            console.log("Deletedresponse", response)
            return response;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// login with firebase token
export const loginWithFirebaseToken = createAsyncThunk(
    "user/loginWithFirebaseToken",
    async (firebaseToken, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/auth/login`,
                { firebaseToken }
            );

            return response.data;
        } catch (error) {
            console.error("🔥 Axios login error:", error);

            if (error.response) {
                return rejectWithValue({
                    status: error.response.status,
                    message: error.response.data?.message || "Login failed",
                    errorDetail: error.response.data?.error || null,
                });
            }

            return rejectWithValue({
                status: 500,
                message: "Internal Server Error",
                errorDetail: error.message,
            });
        }
    }
);

// send refresh token
export const sendRefreshToken = createAsyncThunk(
    "user/sendRefreshToken",
    async (refreshToken, thunkAPI) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}/user/auth/refresh-token`, // Adjust the endpoint as needed
                { refreshToken: refreshToken } // Send the refresh token in the body
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// create user profile address
export const createUserProfileAddress = createAsyncThunk(
    "user/createUserProfileAddress",
    async (data, thunkAPI) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/address/create`, data
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// update user profile address
export const updateUserProfileAddress = createAsyncThunk(
    "user/updateUserProfileAddress",
    async (data, thunkAPI) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/address/update`, data
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// delete user profile address
export const deleteUserProfileAddress = createAsyncThunk(
    "user/deleteUserProfileAddress",
    async (data, thunkAPI) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/user/users/address/delete`, {data}
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

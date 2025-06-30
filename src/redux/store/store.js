import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';
import loginReducer, { loginTransform } from '../login/loginSlice';

const persistConfig = {
  key: 'root',
  storage,
  transforms: [loginTransform],
  whitelist: ['login'] // only login will be persisted
};

const persistedLoginReducer = persistReducer(persistConfig, loginReducer);

export const store = configureStore({
  reducer: {
    login: persistedLoginReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }).concat(logger),
  devTools: import.meta.env.DEV
});

export const persistor = persistStore(store);

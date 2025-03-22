import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studyPlanReducer from './slices/studyPlanSlice';
import analyticsReducer from './slices/analyticsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    studyPlan: studyPlanReducer,
    analytics: analyticsReducer,
  },
});

export default store; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (studyPlanId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/${studyPlanId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateStudySession = createAsyncThunk(
  'analytics/updateStudySession',
  async ({ studyPlanId, sessionData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/analytics/${studyPlanId}/session`,
        sessionData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchStudyInsights = createAsyncThunk(
  'analytics/fetchStudyInsights',
  async (studyPlanId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analytics/${studyPlanId}/insights`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  analytics: null,
  insights: null,
  loading: false,
  error: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
      state.insights = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
      })
      // Update Study Session
      .addCase(updateStudySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudySession.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(updateStudySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update study session';
      })
      // Fetch Study Insights
      .addCase(fetchStudyInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudyInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
      })
      .addCase(fetchStudyInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch study insights';
      });
  }
});

export const { clearError, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer; 
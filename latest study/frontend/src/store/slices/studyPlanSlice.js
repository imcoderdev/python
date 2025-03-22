import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Async thunks
export const fetchStudyPlans = createAsyncThunk(
  'studyPlan/fetchStudyPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/study-plans`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchStudyPlan = createAsyncThunk(
  'studyPlan/fetchStudyPlan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/study-plans/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createStudyPlan = createAsyncThunk(
  'studyPlan/createStudyPlan',
  async (studyPlanData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/study-plans`, studyPlanData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateStudyPlan = createAsyncThunk(
  'studyPlan/updateStudyPlan',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/study-plans/${id}`, data, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteStudyPlan = createAsyncThunk(
  'studyPlan/deleteStudyPlan',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/study-plans/${id}`, {
        headers: getAuthHeader()
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTopicStatus = createAsyncThunk(
  'studyPlan/updateTopicStatus',
  async ({ id, subjectIndex, topicIndex, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/study-plans/${id}/topic-status`,
        { subjectIndex, topicIndex, status },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addFeedback = createAsyncThunk(
  'studyPlan/addFeedback',
  async ({ id, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/study-plans/${id}/feedback`,
        feedbackData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  studyPlans: [],
  currentStudyPlan: null,
  loading: false,
  error: null
};

const studyPlanSlice = createSlice({
  name: 'studyPlan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStudyPlan: (state) => {
      state.currentStudyPlan = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Study Plans
      .addCase(fetchStudyPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudyPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.studyPlans = action.payload;
      })
      .addCase(fetchStudyPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch study plans';
      })
      // Fetch Single Study Plan
      .addCase(fetchStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudyPlan = action.payload;
      })
      .addCase(fetchStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch study plan';
      })
      // Create Study Plan
      .addCase(createStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.studyPlans.unshift(action.payload);
        state.currentStudyPlan = action.payload;
      })
      .addCase(createStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create study plan';
      })
      // Update Study Plan
      .addCase(updateStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.studyPlans.findIndex(plan => plan._id === action.payload._id);
        if (index !== -1) {
          state.studyPlans[index] = action.payload;
        }
        if (state.currentStudyPlan?._id === action.payload._id) {
          state.currentStudyPlan = action.payload;
        }
      })
      .addCase(updateStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update study plan';
      })
      // Delete Study Plan
      .addCase(deleteStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.studyPlans = state.studyPlans.filter(plan => plan._id !== action.payload);
        if (state.currentStudyPlan?._id === action.payload) {
          state.currentStudyPlan = null;
        }
      })
      .addCase(deleteStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete study plan';
      })
      // Update Topic Status
      .addCase(updateTopicStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopicStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentStudyPlan?._id === action.payload._id) {
          state.currentStudyPlan = action.payload;
        }
      })
      .addCase(updateTopicStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update topic status';
      })
      // Add Feedback
      .addCase(addFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentStudyPlan?._id === action.payload._id) {
          state.currentStudyPlan = action.payload;
        }
      })
      .addCase(addFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add feedback';
      });
  }
});

export const { clearError, clearCurrentStudyPlan } = studyPlanSlice.actions;
export default studyPlanSlice.reducer; 
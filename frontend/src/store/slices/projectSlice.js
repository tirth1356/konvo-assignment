import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { logout } from './authSlice';

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects');
  }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, projectData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to delete project');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null
  },
  reducers: {
    clearProjectError: (state) => { state.error = null; },
    adjustTaskCount: (state, action) => {
      const { projectId, increment, completedIncrement } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        if (increment !== undefined) project.total_tasks = Math.max(0, (project.total_tasks || 0) + increment);
        if (completedIncrement !== undefined) project.completed_tasks = Math.max(0, (project.completed_tasks || 0) + completedIncrement);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.projects = action.payload; })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProject.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProject.fulfilled, (state, action) => { state.loading = false; state.projects.unshift(action.payload); })
      .addCase(createProject.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.projects[index] = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      // Clear state when user logs out to prevent stale data on next login
      .addCase(logout.fulfilled, (state) => {
        state.projects = [];
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearProjectError, adjustTaskCount } = projectSlice.actions;
export default projectSlice.reducer;

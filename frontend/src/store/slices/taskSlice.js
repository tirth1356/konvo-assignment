import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { adjustTaskCount } from './projectSlice';
import { logout } from './authSlice';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (projectId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return { projectId, tasks: response.data };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async ({ projectId, taskData }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    dispatch(adjustTaskCount({ projectId, increment: 1 }));
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, projectId, taskData, previousStatus }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);

    if (taskData.status !== undefined && taskData.status !== previousStatus) {
      const completedInc = taskData.status === 'completed' ? 1 : -1;
      dispatch(adjustTaskCount({ projectId, completedIncrement: completedInc }));
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async ({ id, projectId, isCompleted }, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    dispatch(adjustTaskCount({
      projectId,
      increment: -1,
      completedIncrement: isCompleted ? -1 : 0
    }));
    return { id, projectId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to delete task');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasksByProject: {},
    loading: false,
    error: null
  },
  reducers: {
    clearTaskError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasksByProject[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload;
        if (!state.tasksByProject[task.project_id]) state.tasksByProject[task.project_id] = [];
        state.tasksByProject[task.project_id].push(task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const task = action.payload;
        const list = state.tasksByProject[task.project_id];
        if (list) {
          const idx = list.findIndex(t => t.id === task.id);
          if (idx !== -1) list[idx] = task;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { id, projectId } = action.payload;
        if (state.tasksByProject[projectId]) {
          state.tasksByProject[projectId] = state.tasksByProject[projectId].filter(t => t.id !== id);
        }
      })
      // Clear all cached task data on logout
      .addCase(logout.fulfilled, (state) => {
        state.tasksByProject = {};
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;

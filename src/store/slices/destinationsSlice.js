import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosRequest from '../../plugins/axios';

export const getDestinations = createAsyncThunk('destinationsSlice/getDestinations', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/destinations/');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const createDestination = createAsyncThunk('destinationsSlice/createDestination', async (name, thunkAPI) => {
    try {
        const response = await axiosRequest.post('api/destinations/', { name });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

export const deleteDestination = createAsyncThunk('destinationsSlice/deleteDestination', async (id, thunkAPI) => {
    try {
        await axiosRequest.delete(`api/destinations/${id}/`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

const destinationsSlice = createSlice({
    name: 'destinations',
    initialState: {
        loading: false,
        destinations: [],
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getDestinations.pending, (state) => {
                state.loading = true;
            })
            .addCase(getDestinations.fulfilled, (state, action) => {
                state.loading = false;
                state.destinations = action.payload;
            })
            .addCase(getDestinations.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(createDestination.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDestination.fulfilled, (state, action) => {
                state.loading = false;
                // Check if destination already exists
                const exists = state.destinations.find(d => d.id === action.payload.id || d.name === action.payload.name);
                if (!exists) {
                    state.destinations.push(action.payload);
                }
            })
            .addCase(createDestination.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload?.name?.[0] || action.payload?.detail || "";
            })
            .addCase(deleteDestination.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteDestination.fulfilled, (state, action) => {
                state.loading = false;
                state.destinations = state.destinations.filter(d => d.id !== action.payload);
            })
            .addCase(deleteDestination.rejected, (state, action) => {
                state.loading = false;
            });
    },
});

export default destinationsSlice.reducer;

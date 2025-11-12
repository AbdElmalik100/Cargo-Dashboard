import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosRequest from '../../plugins/axios';


export const getShipments = createAsyncThunk('inShipmentsSlice/getShipments', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/in-shipments/');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const getInShipmentsStats = createAsyncThunk('inShipmentsSlice/getInShipmentsStats', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/in-shipments/stats/');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const createShipment = createAsyncThunk('inShipmentsSlice/createShipment', async (data, thunkAPI) => {
    try {
        const response = await axiosRequest.post('api/in-shipments/', data);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

export const updateShipment = createAsyncThunk('inShipmentsSlice/updateShipment', async ({id, updatedData}, thunkAPI) => {
    try {
        const response = await axiosRequest.patch(`api/in-shipments/${id}/`, updatedData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

export const deleteShipment = createAsyncThunk('inShipmentsSlice/deleteShipment', async (id, thunkAPI) => {
    try {
        await axiosRequest.delete(`api/in-shipments/${id}/`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

const inShipmentsSlice = createSlice({
    name: 'inShipments',
    initialState: {
        loading: false,
        shipments: [],
        inShipmentsStats: null,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getShipments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getShipments.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments = action.payload;
            })
            .addCase(getShipments.rejected, (state) => {
                state.loading = false;
                state.shipments = null;
            });

        builder
            .addCase(getInShipmentsStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(getInShipmentsStats.fulfilled, (state, action) => {
                state.loading = false;
                state.inShipmentsStats = action.payload;
            })
            .addCase(getInShipmentsStats.rejected, (state) => {
                state.loading = false;
                state.inShipmentsStats = null;
            });

        builder
            .addCase(createShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments.push(action.payload);
            })
            .addCase(createShipment.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(updateShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments = state.shipments.map(shipment => shipment.id !== action.payload.id ? shipment : action.payload);
            })
            .addCase(updateShipment.rejected, (state) => {
                state.loading = false;
            });
            builder
            .addCase(deleteShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments = state.shipments.filter(shipment => shipment.id !== action.meta.arg);
            })
            .addCase(deleteShipment.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default inShipmentsSlice.reducer;



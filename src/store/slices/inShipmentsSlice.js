import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosRequest from '../../plugins/axios';
import { toast } from 'sonner';


export const getShipments = createAsyncThunk('inShipmentsSlice/getShipments', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/in-shipments/');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const getShipmentsStats = createAsyncThunk('inShipmentsSlice/getShipmentsStats', async (_, thunkAPI) => {
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
        shipmentsStats: null,
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
            .addCase(getShipments.rejected, (state, action) => {
                state.loading = false;
                state.shipments = null;
            });

        builder
            .addCase(getShipmentsStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(getShipmentsStats.fulfilled, (state, action) => {
                state.loading = false;
                state.shipmentsStats = action.payload;
            })
            .addCase(getShipmentsStats.rejected, (state, action) => {
                state.loading = false;
                state.shipmentsStats = null;
            });

        builder
            .addCase(createShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(createShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments.push(action.payload);
            })
            .addCase(createShipment.rejected, (state, action) => {
                state.loading = false;
                const errorData = action.payload;
                if (errorData?.bill_number) {
                    toast.error(Array.isArray(errorData.bill_number) ? errorData.bill_number[0] : errorData.bill_number);
                } else {
                    toast.error("حدث خطأ اثناء انشاء الشحنة , حاول مرة اخرى");
                }
            });

        builder
            .addCase(updateShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments = state.shipments.map(shipment => shipment.id !== action.payload.id ? shipment : action.payload);
                toast.success("تم تحديث بيانات الشحنة بنجاح");
            })
            .addCase(updateShipment.rejected, (state, action) => {
                state.loading = false;
                const errorData = action.payload;
                if (errorData?.bill_number) {
                    toast.error(Array.isArray(errorData.bill_number) ? errorData.bill_number[0] : errorData.bill_number);
                } else {
                    toast.error("حدث خطأ اثناء تعديل البيانات , حاول مرة اخرى");
                }
            });
            builder
            .addCase(deleteShipment.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteShipment.fulfilled, (state, action) => {
                state.loading = false;
                state.shipments = state.shipments.filter(shipment => shipment.id !== action.meta.arg);
                toast.success("تم حذف الشحنة بنجاح");
            })
            .addCase(deleteShipment.rejected, (state, action) => {
                state.loading = false;
                toast.error("حدث خطأ اثناء حذف البيانات , حاول مرة اخرى");
            });
    },
});

export default inShipmentsSlice.reducer;



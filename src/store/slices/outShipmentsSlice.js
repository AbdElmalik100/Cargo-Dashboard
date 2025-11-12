import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosRequest from '../../plugins/axios'
import { createShipment, updateShipment, deleteShipment } from './inShipmentsSlice'

const matchesOutShipment = (shipment) => !shipment?.export

export const getOutShipments = createAsyncThunk('outShipmentsSlice/getOutShipments', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/in-shipments/', {
            params: { export: 'false' },
        })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

export const getAllOutShipments = createAsyncThunk('outShipmentsSlice/getAllOutShipments', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/out-shipments/')
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

export const getOutShipmentsStats = createAsyncThunk('outShipmentsSlice/getOutShipmentsStats', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/out-shipments/stats/')
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

export const createOutShipment = createAsyncThunk('outShipmentsSlice/createOutShipment', async (data, thunkAPI) => {
    try {
        const response = await axiosRequest.post('api/out-shipments/', data)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

export const updateOutShipment = createAsyncThunk('outShipmentsSlice/updateOutShipment', async ({ id, data }, thunkAPI) => {
    try {
        const response = await axiosRequest.patch(`api/out-shipments/${id}/`, data)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

export const deleteOutShipment = createAsyncThunk('outShipmentsSlice/deleteOutShipment', async (id, thunkAPI) => {
    try {
        await axiosRequest.delete(`api/out-shipments/${id}/`)
        return id
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

const outShipmentsSlice = createSlice({
    name: 'outShipments',
    initialState: {
        loading: false,
        shipments: [],
        allShipments: [],
        shipmentsStats: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getOutShipments.pending, (state) => {
                state.loading = true
            })
            .addCase(getOutShipments.fulfilled, (state, action) => {
                state.loading = false
                const shipments = (action.payload || []).filter(matchesOutShipment)
                state.shipments = shipments
            })
            .addCase(getOutShipments.rejected, (state) => {
                state.loading = false
                state.shipments = []
            })
            .addCase(getAllOutShipments.pending, (state) => {
                state.loading = true
            })
            .addCase(getAllOutShipments.fulfilled, (state, action) => {
                state.loading = false
                state.allShipments = action.payload || []
            })
            .addCase(getAllOutShipments.rejected, (state) => {
                state.loading = false
                state.allShipments = []
            })
            .addCase(getOutShipmentsStats.pending, (state) => {
                state.loading = true
            })
            .addCase(getOutShipmentsStats.fulfilled, (state, action) => {
                state.loading = false
                state.shipmentsStats = action.payload || null
            })
            .addCase(getOutShipmentsStats.rejected, (state) => {
                state.loading = false
                state.shipmentsStats = null
            })
            .addCase(createOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(createOutShipment.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createOutShipment.rejected, (state) => {
                state.loading = false
            })
            .addCase(updateOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(updateOutShipment.fulfilled, (state, action) => {
                state.loading = false
                const updated = action.payload
                if (updated) {
                    const index = state.allShipments.findIndex(item => item.id === updated.id)
                    if (index !== -1) {
                        state.allShipments[index] = updated
                    } else {
                        state.allShipments.unshift(updated)
                    }
                }
            })
            .addCase(updateOutShipment.rejected, (state) => {
                state.loading = false
            })
            .addCase(deleteOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteOutShipment.fulfilled, (state, action) => {
                state.loading = false
                const deletedId = action.payload ?? action.meta.arg
                state.allShipments = state.allShipments.filter(shipment => shipment.id !== deletedId)
            })
            .addCase(deleteOutShipment.rejected, (state) => {
                state.loading = false
            })
            .addCase(createShipment.fulfilled, (state, action) => {
                const shipment = action.payload
                if (matchesOutShipment(shipment)) {
                    state.shipments.unshift(shipment)
                }
            })
            .addCase(updateShipment.fulfilled, (state, action) => {
                const shipment = action.payload
                const index = state.shipments.findIndex(item => item.id === shipment.id)
                if (matchesOutShipment(shipment)) {
                    if (index !== -1) {
                        state.shipments[index] = shipment
                    } else {
                        state.shipments.unshift(shipment)
                    }
                } else if (index !== -1) {
                    state.shipments.splice(index, 1)
                }
            })
            .addCase(deleteShipment.fulfilled, (state, action) => {
                state.shipments = state.shipments.filter(shipment => shipment.id !== action.meta.arg)
            })
    },
})

export default outShipmentsSlice.reducer


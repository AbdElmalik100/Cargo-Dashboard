import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosRequest from '../../plugins/axios'
import { toast } from 'sonner'
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
            .addCase(getOutShipments.rejected, (state, action) => {
                state.loading = false
                state.shipments = []
                if (action.payload) {
                    toast.error("حدث خطأ أثناء جلب الشحنات الصادرة")
                }
            })
            .addCase(getAllOutShipments.pending, (state) => {
                state.loading = true
            })
            .addCase(getAllOutShipments.fulfilled, (state, action) => {
                state.loading = false
                state.allShipments = action.payload || []
            })
            .addCase(getAllOutShipments.rejected, (state, action) => {
                state.loading = false
                state.allShipments = []
                if (action.payload) {
                    toast.error("حدث خطأ أثناء جلب جميع الشحنات الصادرة")
                }
            })
            .addCase(getOutShipmentsStats.pending, (state) => {
                state.loading = true
            })
            .addCase(getOutShipmentsStats.fulfilled, (state, action) => {
                state.loading = false
                state.shipmentsStats = action.payload || null
            })
            .addCase(getOutShipmentsStats.rejected, (state, action) => {
                state.loading = false
                state.shipmentsStats = null
                if (action.payload) {
                    toast.error("حدث خطأ أثناء جلب إحصائيات الشحنات الصادرة")
                }
            })
            .addCase(createOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(createOutShipment.fulfilled, (state) => {
                state.loading = false
                toast.success("تم إنشاء شحنة التصدير بنجاح")
            })
            .addCase(createOutShipment.rejected, (state, action) => {
                state.loading = false
                const errorData = action.payload
                const msg = typeof errorData === 'string' ? errorData : "حدث خطأ أثناء إنشاء شحنة التصدير"
                toast.error(msg)
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
                toast.success("تم تحديث الشحنة الصادرة بنجاح")
            })
            .addCase(updateOutShipment.rejected, (state, action) => {
                state.loading = false
                const errorData = action.payload
                const msg = typeof errorData === 'string' ? errorData : "حدث خطأ أثناء تحديث الشحنة الصادرة"
                toast.error(msg)
            })
            .addCase(deleteOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteOutShipment.fulfilled, (state, action) => {
                state.loading = false
                const deletedId = action.payload ?? action.meta.arg
                state.allShipments = state.allShipments.filter(shipment => shipment.id !== deletedId)
                toast.success("تم حذف الشحنة الصادرة بنجاح")
            })
            .addCase(deleteOutShipment.rejected, (state, action) => {
                state.loading = false
                const errorData = action.payload
                const msg = typeof errorData === 'string' ? errorData : "حدث خطأ أثناء حذف الشحنة الصادرة"
                toast.error(msg)
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
            .addCase(deleteShipment.rejected, (state, action) => {
                if (action.payload) {
                    toast.error("حدث خطأ اثناء حذف البيانات , حاول مرة اخرى")
                }
            })
    },
})

export default outShipmentsSlice.reducer


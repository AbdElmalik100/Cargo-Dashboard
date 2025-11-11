import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosRequest from '../../plugins/axios'
import { toast } from 'sonner'
import { createShipment, updateShipment, deleteShipment } from './inShipmentsSlice'

const matchesOutShipment = (shipment) => !shipment?.export

const calculateStats = (shipments = []) => {
    if (!shipments.length) {
        return {
            total_shipments: 0,
            total_weight: 0,
            total_payment_fees: 0,
            total_ground_fees: 0,
            last_updated: new Date().toISOString(),
        }
    }

    const totals = shipments.reduce(
        (acc, shipment) => {
            acc.total_weight += Number(shipment.weight || 0)
            acc.total_payment_fees += Number(shipment.payment_fees || 0)
            acc.total_ground_fees += Number(shipment.ground_fees || 0)

            const updatedAt = shipment.updated_at ? new Date(shipment.updated_at) : null
            if (updatedAt && !isNaN(updatedAt.getTime()) && updatedAt > acc.maxDate) {
                acc.maxDate = updatedAt
            }

            return acc
        },
        {
            total_weight: 0,
            total_payment_fees: 0,
            total_ground_fees: 0,
            maxDate: new Date(0),
        }
    )

    return {
        total_shipments: shipments.length,
        total_weight: totals.total_weight,
        total_payment_fees: totals.total_payment_fees,
        total_ground_fees: totals.total_ground_fees,
        last_updated: (
            isNaN(totals.maxDate.getTime())
                ? new Date()
                : totals.maxDate
        ).toISOString(),
    }
}

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

export const createOutShipment = createAsyncThunk('outShipmentsSlice/createOutShipment', async (data, thunkAPI) => {
    try {
        const response = await axiosRequest.post('api/out-shipments/', data)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message)
    }
})

const outShipmentsSlice = createSlice({
    name: 'outShipments',
    initialState: {
        loading: false,
        shipments: [],
        allShipments: [], // All out-shipments for reports
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
                state.shipmentsStats = calculateStats(shipments)
            })
            .addCase(getOutShipments.rejected, (state, action) => {
                state.loading = false
                state.shipments = []
                state.shipmentsStats = calculateStats([])
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
            .addCase(createOutShipment.pending, (state) => {
                state.loading = true
            })
            .addCase(createOutShipment.fulfilled, (state, action) => {
                state.loading = false
                // OutShipments endpoint returns the created out record; remove the corresponding inbound from this list
                // However, our listing here contains inbound (export=false) shipments, so we refetch instead.
                toast.success("تم إنشاء شحنة التصدير بنجاح")
            })
            .addCase(createOutShipment.rejected, (state, action) => {
                state.loading = false
                const errorData = action.payload
                const msg = typeof errorData === 'string' ? errorData : "حدث خطأ أثناء إنشاء شحنة التصدير"
                toast.error(msg)
            })
            .addCase(createShipment.fulfilled, (state, action) => {
                const shipment = action.payload
                if (matchesOutShipment(shipment)) {
                    state.shipments.unshift(shipment)
                    state.shipmentsStats = calculateStats(state.shipments)
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

                state.shipmentsStats = calculateStats(state.shipments)
            })
            .addCase(deleteShipment.fulfilled, (state, action) => {
                state.shipments = state.shipments.filter(shipment => shipment.id !== action.meta.arg)
                state.shipmentsStats = calculateStats(state.shipments)
            })
            .addCase(deleteShipment.rejected, (state, action) => {
                if (action.payload) {
                    toast.error("حدث خطأ اثناء حذف البيانات , حاول مرة اخرى")
                }
            })
    },
})

export default outShipmentsSlice.reducer


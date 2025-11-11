import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosRequest from '../../plugins/axios';
import { toast } from 'sonner';

export const getCompanies = createAsyncThunk('companiesSlice/getCompanies', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('api/companies/');
        return response.data;
    } catch (error) {
        // If API endpoint doesn't exist yet, return empty array instead of error
        if (error.response?.status === 404) {
            return [];
        }
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const createCompany = createAsyncThunk('companiesSlice/createCompany', async (name, thunkAPI) => {
    try {
        const response = await axiosRequest.post('api/companies/', { name });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

export const deleteCompany = createAsyncThunk('companiesSlice/deleteCompany', async (id, thunkAPI) => {
    try {
        await axiosRequest.delete(`api/companies/${id}/`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

const companiesSlice = createSlice({
    name: 'companies',
    initialState: {
        loading: false,
        companies: [],
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getCompanies.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCompanies.fulfilled, (state, action) => {
                state.loading = false;
                state.companies = action.payload;
            })
            .addCase(getCompanies.rejected, (state, action) => {
                state.loading = false;
                // Only show error if it's not a 404 (endpoint doesn't exist yet)
                const errorMessage = action.payload?.toString() || '';
                if (errorMessage && !errorMessage.includes('404')) {
                    toast.error("حدث خطأ اثناء جلب الشركات");
                }
                state.companies = [];
            })
            .addCase(createCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCompany.fulfilled, (state, action) => {
                state.loading = false;
                // Check if company already exists
                const exists = state.companies.find(c => c.id === action.payload.id || c.name === action.payload.name);
                if (!exists) {
                    state.companies.push(action.payload);
                }
                toast.success("تم إضافة الشركة بنجاح");
            })
            .addCase(createCompany.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload?.name?.[0] || action.payload?.detail || "حدث خطأ اثناء إضافة الشركة";
                toast.error(errorMessage);
            })
            .addCase(deleteCompany.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCompany.fulfilled, (state, action) => {
                state.loading = false;
                state.companies = state.companies.filter(c => c.id !== action.payload);
                toast.success("تم حذف الشركة بنجاح");
            })
            .addCase(deleteCompany.rejected, (state, action) => {
                state.loading = false;
                toast.error("حدث خطأ اثناء حذف الشركة");
            });
    },
});

export default companiesSlice.reducer;


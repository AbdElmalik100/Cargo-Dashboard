import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosRequest from '../../plugins/axios';
import Cookies from 'js-cookie';


export const me = createAsyncThunk('userSlice/me', async (_, thunkAPI) => {
    try {
        const response = await axiosRequest.get('auth/users/me');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});
export const login = createAsyncThunk('userSlice/login', async (credentials, thunkAPI) => {
    try {
        const response = await axiosRequest.post('auth/token/login', credentials);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});
export const logout = createAsyncThunk('userSlice/logout', async () => {
    try {
        const response = await axiosRequest.post('auth/token/logout');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        loading: false,
        user: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(me.pending, (state) => {
                state.user = null;
                state.loading = true;
            })
            .addCase(me.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(me.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
            });
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                Cookies.set("user_token", action.payload.auth_token, { expires: 36500 })
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
            });

        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.loading = false;
                Cookies.remove("user_token")
                state.user = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
            });
    },
});


export default userSlice.reducer;
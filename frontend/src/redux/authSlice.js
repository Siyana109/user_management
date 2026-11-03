import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// User Registration
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Registration failed'
            );
        }
    }
);

// User Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

// Admin Login
export const loginAdmin = createAsyncThunk(
    'auth/adminLogin',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/admin/login', credentials);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Admin login failed'
            );
        }
    }
);


// Restore Authentication
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Not authenticated'
            );
        }
    }
);


const authSlice = createSlice({
    name: 'auth',

    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        checkingAuth: true,
        error: null
    },

    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },

        clearError: (state) => {
            state.error = null;
        },

        setCredentials: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder

            // Registration
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // User Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Admin Login
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })

            // Restore Authentication
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkAuth.pending, (state) => {
                state.checkingAuth = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.checkingAuth = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.checkingAuth = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Keep the current Redux user if logout fails.
            })
    }
});



// Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Logout failed'
            );
        }
    }
);


export const {
    logout,
    clearError,
    setCredentials
} = authSlice.actions;

export default authSlice.reducer;
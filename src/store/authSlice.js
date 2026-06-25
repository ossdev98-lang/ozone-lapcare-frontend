import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../api/services'

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data)
    const { accessToken, refreshToken, user } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    return user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe()
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await authAPI.logout() } catch {}
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    clearError: state => { state.error = null },
    setUser: (state, { payload }) => { state.user = payload },
    setInitialized: state => { state.initialized = true },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload })
      .addCase(loginUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(registerUser.pending, state => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, state => { state.loading = false })
      .addCase(registerUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
      .addCase(fetchMe.fulfilled, (state, { payload }) => { state.user = payload; state.initialized = true })
      .addCase(fetchMe.rejected, state => { state.initialized = true })
      .addCase(logoutUser.fulfilled, state => { state.user = null })
  }
})

export const { clearError, setUser, setInitialized } = authSlice.actions
export default authSlice.reducer

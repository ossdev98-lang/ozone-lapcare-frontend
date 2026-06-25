import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartAPI } from '../api/services'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return (await cartAPI.get()).data.data } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const addToCart = createAsyncThunk('cart/add', async (data, { dispatch, rejectWithValue }) => {
  try { await cartAPI.add(data); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }, { dispatch, rejectWithValue }) => {
  try { await cartAPI.update(id, { quantity }); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const removeFromCart = createAsyncThunk('cart/remove', async (id, { dispatch, rejectWithValue }) => {
  try { await cartAPI.remove(id); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const clearCart = createAsyncThunk('cart/clear', async (_, { dispatch }) => {
  await cartAPI.clear(); dispatch(fetchCart())
})
export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { dispatch }) => {
  try { await cartAPI.removeCoupon(); dispatch(fetchCart()) } catch {}
})

export const applyCoupon = createAsyncThunk('cart/coupon', async (code, { dispatch, rejectWithValue }) => {
  try { const res = await cartAPI.applyCoupon({ code }); dispatch(fetchCart()); return res.data.data } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0, coupon: null, discount: 0, loading: false, error: null },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, state => { state.loading = true })
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false
        state.items = payload?.items || []
        state.subtotal = payload?.subtotal || 0
        state.tax = payload?.tax || 0
        state.shipping = payload?.shipping || 0
        state.total = payload?.total || 0
        state.coupon = payload?.coupon || null
      })
      .addCase(fetchCart.rejected, state => { state.loading = false })
  }
})

export default cartSlice.reducer

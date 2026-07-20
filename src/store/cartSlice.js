import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartAPI } from '../api/services'

const GUEST_CART_KEY = 'guest_cart'

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [] } catch { return [] }
}
const setGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return (await cartAPI.get()).data.data } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const addToCart = createAsyncThunk('cart/add', async (data, { dispatch, getState, rejectWithValue }) => {
  const { user } = getState().auth
  if (!user) {
    const items = getGuestCart()
    const existing = items.find(i => i.productId === data.productId)
    if (existing) { existing.quantity += data.quantity || 1 }
    else {
      items.push({
        productId: data.productId,
        quantity: data.quantity || 1,
        product: data.product || {}
      })
    }
    setGuestCart(items)
    dispatch(guestCartUpdated())
    return
  }
  try { await cartAPI.add(data); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const updateCartItem = createAsyncThunk('cart/update', async ({ id, quantity }, { dispatch, getState, rejectWithValue }) => {
  const { user } = getState().auth
  if (!user) {
    const items = getGuestCart()
    const item = items.find(i => i.productId === id)
    if (item) { item.quantity = quantity; setGuestCart(items); dispatch(guestCartUpdated()) }
    return
  }
  try { await cartAPI.update(id, { quantity }); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const removeFromCart = createAsyncThunk('cart/remove', async (id, { dispatch, getState, rejectWithValue }) => {
  const { user } = getState().auth
  if (!user) {
    const items = getGuestCart().filter(i => i.productId !== id)
    setGuestCart(items)
    dispatch(guestCartUpdated())
    return
  }
  try { await cartAPI.remove(id); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const clearCart = createAsyncThunk('cart/clear', async (_, { dispatch, getState }) => {
  const { user } = getState().auth
  if (!user) { localStorage.removeItem(GUEST_CART_KEY); dispatch(guestCartUpdated()); return }
  await cartAPI.clear(); dispatch(fetchCart())
})
export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { dispatch, rejectWithValue }) => {
  try { await cartAPI.removeCoupon(); dispatch(fetchCart()) } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to remove coupon') }
})
export const applyCoupon = createAsyncThunk('cart/coupon', async (code, { dispatch, rejectWithValue }) => {
  try { const res = await cartAPI.applyCoupon({ code }); dispatch(fetchCart()); return res.data.data } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const mergeGuestCart = createAsyncThunk('cart/merge', async (_, { dispatch, rejectWithValue }) => {
  const guestItems = getGuestCart()
  if (!guestItems.length) return
  try {
    await cartAPI.merge({ items: guestItems })
    localStorage.removeItem(GUEST_CART_KEY)
    dispatch(fetchCart())
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
export const guestCartUpdated = () => ({ type: 'cart/guestUpdated' })

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0, coupon: null, discount: 0, loading: false, error: null, freeShippingThreshold: 999, shippingCharge: 99, guestItems: getGuestCart() },
  reducers: {
    initGuestCart: state => { state.guestItems = getGuestCart() },
    clearGuestCart: state => { state.guestItems = []; localStorage.removeItem(GUEST_CART_KEY) },
  },
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
        state.discount = payload?.discount || 0
        state.freeShippingThreshold = payload?.freeShippingThreshold || 999
        state.shippingCharge = payload?.shippingCharge ?? 99
      })
      .addCase(fetchCart.rejected, state => { state.loading = false })
      .addCase('cart/guestUpdated', state => { state.guestItems = getGuestCart() })
  }
})

export const { initGuestCart, clearGuestCart } = cartSlice.actions
export default cartSlice.reducer

import { createSlice } from '@reduxjs/toolkit';

const loadCompareFromStorage = () => {
  try {
    const saved = localStorage.getItem('croma_compare_items');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveCompareToStorage = (items) => {
  try {
    localStorage.setItem('croma_compare_items', JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save compare items', e);
  }
};

const initialState = {
  compareItems: loadCompareFromStorage(), // Max 4 products
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      const exists = state.compareItems.some((p) => p._id === product._id);
      if (!exists) {
        if (state.compareItems.length >= 4) {
          state.compareItems.shift(); // Remove oldest item if max 4 reached
        }
        state.compareItems.push(product);
        saveCompareToStorage(state.compareItems);
      }
    },
    removeFromCompare: (state, action) => {
      const productId = action.payload;
      state.compareItems = state.compareItems.filter((p) => p._id !== productId);
      saveCompareToStorage(state.compareItems);
    },
    clearCompare: (state) => {
      state.compareItems = [];
      saveCompareToStorage([]);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;

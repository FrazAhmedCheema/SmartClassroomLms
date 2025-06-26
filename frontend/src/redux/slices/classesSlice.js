import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

import picture1 from "../../assets/classPicture1.jpg";
import picture2 from "../../assets/classPicture2.jpg";
import picture3 from "../../assets/classPicture3.jpg";
import picture4 from "../../assets/classPicture4.jpg";
import picture5 from "../../assets/classPicture5.jpg";
import picture6 from "../../assets/classPicture6.jpg";
import picture7 from "../../assets/classPicture7.jpg";
import picture8 from "../../assets/classPicture8.jpg";
import picture9 from "../../assets/classPicture9.jpg";

const coverImages = [
  picture1,
  picture2,
  picture3,
  picture4,
  picture5,
  picture6,
  picture7,
  picture8,
  picture9
];
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Remove useNavigate as it can't be used here
      const response = await fetch('http://localhost:8080/teacher/classes', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched classes:', data.classes);
        
        // If data.classes is undefined or not an array, handle it gracefully
        if (!data.classes || !Array.isArray(data.classes)) {
          console.error('Invalid classes data received:', data);
          return [];
        }
        
        const classesWithImages = data.classes.map((cls, index) => ({
          ...cls,
          coverImage: coverImages[index % coverImages.length]
        }));
        return classesWithImages;
      } else {
        // Instead of navigating, we'll just return the error
        // The component can handle navigation if needed
        const errorData = await response.json();
        console.error('API error response:', errorData);
        return rejectWithValue(errorData);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      return rejectWithValue(error.message);
    }
  }
);

const classesSlice = createSlice({
  name: 'classes',
  initialState: {
    classes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.status = 'loading';
        console.log('Fetching classes...');
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.classes = action.payload;
        console.log('Classes fetched successfully:', action.payload);
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('Failed to fetch classes:', action.payload);
      });
  },
});

export const selectClassesState = (state) => state.classes || { classes: [], status: 'idle', error: null };

export const selectClasses = createSelector(
  [selectClassesState],
  (classesState) => classesState.classes
);

export const selectClassesStatus = createSelector(
  [selectClassesState],
  (classesState) => classesState.status
);

export const selectClassesError = createSelector(
  [selectClassesState],
  (classesState) => classesState.error
);

export default classesSlice.reducer;

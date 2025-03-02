import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const coverImages = [
  'https://gstatic.com/classroom/themes/img_code.jpg',
  'https://gstatic.com/classroom/themes/img_breakfast.jpg',
  'https://gstatic.com/classroom/themes/img_bookclub.jpg',
  'https://gstatic.com/classroom/themes/img_reachout.jpg'
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

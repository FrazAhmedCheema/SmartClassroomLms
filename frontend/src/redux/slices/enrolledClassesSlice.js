import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const coverImages = [
  'https://gstatic.com/classroom/themes/img_code.jpg',
  'https://gstatic.com/classroom/themes/img_breakfast.jpg',
  'https://gstatic.com/classroom/themes/img_bookclub.jpg',
  'https://gstatic.com/classroom/themes/img_reachout.jpg'
];

export const fetchEnrolledClasses = createAsyncThunk(
  'enrolledClasses/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/enrolled-classes', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Add console.log to debug the response
        console.log('Raw API response:', data);
        
        // Handle both possible response structures
        const classesToProcess = data.enrolledClasses || data.classes || [];
        
        const classesWithImages = classesToProcess.map((cls, index) => ({
          ...cls,
          coverImage: coverImages[index % coverImages.length]
        }));
        
        console.log('Processed classes:', classesWithImages);
        return classesWithImages;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const joinClass = createAsyncThunk(
  'enrolledClasses/joinClass',
  async (classCode, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/student/join-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ classCode }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.class;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const enrolledClassesSlice = createSlice({
  name: 'enrolledClasses',
  initialState: {
    classes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolledClasses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEnrolledClasses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.classes = action.payload;
        state.error = null;
      })
      .addCase(fetchEnrolledClasses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(joinClass.fulfilled, (state, action) => {
        state.classes.push({
          ...action.payload,
          coverImage: coverImages[state.classes.length % coverImages.length]
        });
      });
  },
});

export default enrolledClassesSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

// Add this selector before the export default
export const selectEnrolledClasses = (state) => state.enrolledClasses.classes;

export default enrolledClassesSlice.reducer;

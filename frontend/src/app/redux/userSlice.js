import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APP_SETTINGS } from "../../config";
import { apiClient } from "./api/axiosSetup";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch (error) {
    return null;
  }
};

export const signIn = createAsyncThunk("user/signIn", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post(APP_SETTINGS.API_PATH.USER.login, credentials);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to sign in");
  }
});

export const signUp = createAsyncThunk("user/signUp", async (values, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post(APP_SETTINGS.API_PATH.USER.create, values);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to create account");
  }
});

export const signOut = createAsyncThunk("user/signOut", async () => {
  try {
    await apiClient.post(APP_SETTINGS.API_PATH.USER.logout);
  } finally {
    localStorage.removeItem("user");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: { user: readStoredUser(), loading: false, error: null },
  reducers: {
    clearAuthError(state) { state.error = null; }
  },
  extraReducers(builder) {
    builder
      .addCase(signIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signIn.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(signIn.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signUp.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signUp.fulfilled, (state) => { state.loading = false; })
      .addCase(signUp.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signOut.fulfilled, (state) => { state.user = null; });
  }
});

export const { clearAuthError } = userSlice.actions;
export default userSlice.reducer;

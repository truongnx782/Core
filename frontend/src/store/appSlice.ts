import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  breakpoints: {
    xs: boolean;
    sm: boolean;
    md: boolean;
    lg: boolean;
    xl: boolean;
    xxl: boolean;
  };
}

const initialState: AppState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  breakpoints: {
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false,
  },
};

/**
 * Slice for global UI/App state / Slice quản lý trạng thái UI và ứng dụng dùng chung.
 */
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setBreakpoints: (state, action: PayloadAction<AppState["breakpoints"]>) => {
      state.breakpoints = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebar,
  toggleMobileMenu,
  setMobileMenu,
  setBreakpoints,
} = appSlice.actions;
export default appSlice.reducer;

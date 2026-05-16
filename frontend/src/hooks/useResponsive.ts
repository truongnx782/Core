import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const useResponsive = () => {
  const s = useSelector((state: RootState) => state.app.breakpoints);

  return {
    isMobile: s.md === false,
    isTablet: !!(s.md && !s.xl),
    tableScrollX: s.md ? "max-content" : 800,
    modalWidth: s.md ? 600 : "95%",
    padding: s.md ? 24 : 16,
    breakpoints: s,
  };
};

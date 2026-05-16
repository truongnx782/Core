import { Grid } from "antd";
const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const s = useBreakpoint() || {};
  return {
    isMobile: s.md === false,
    isTablet: !!(s.md && !s.xl),
    tableScrollX: s.md ? "max-content" : 800,
    modalWidth: s.md ? 600 : "95%",
    padding: s.md ? 24 : 16,
  };
};

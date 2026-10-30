import { useWindowDimensions, Platform } from "react-native";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isWeb: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  columns: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1280;

  const contentMaxWidth = isWide ? 1240 : isDesktop ? 1080 : isTablet ? 740 : width;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const columns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isWeb,
    contentMaxWidth,
    horizontalPadding,
    columns,
  };
}

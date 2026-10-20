import {
  AntDesign,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";

// Google Logo
export function GoogleLogo({ size = 24 }: { size?: number }) {
  return <AntDesign name="google" size={size} color="#4285F4" />;
}

// Apple Logo
export function AppleLogo({
  size = 24,
  color = "#000000",
}: {
  size?: number;
  color?: string;
}) {
  return <Ionicons name="logo-apple" size={size} color={color} />;
}

// Facebook Logo
export function FacebookLogo({ size = 24 }: { size?: number }) {
  return <FontAwesome name="facebook" size={size} color="#1877F2" />;
}
import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";

interface ButtonProps extends PressableProps {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: string;
  haptic?: "light" | "medium" | "heavy" | "selection" | "none";
}

const VARIANTS = {
  primary: "bg-neutral-900 active:bg-neutral-800",
  outline: "bg-transparent border border-neutral-300 active:bg-neutral-100",
  ghost: "bg-transparent active:bg-neutral-100",
  destructive: "bg-red-600 active:bg-red-700",
} as const;

const VARIANT_TEXT = {
  primary: "text-white",
  outline: "text-neutral-900",
  ghost: "text-neutral-900",
  destructive: "text-white",
} as const;

const SIZES = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-6 py-3",
} as const;

const HAPTIC_MAP = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  selection: null,
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  haptic = "light",
  onPress,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    if (isDisabled) return;
    if (haptic !== "none") {
      if (haptic === "selection") {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(HAPTIC_MAP[haptic]!);
      }
    }
    onPress?.(e);
  };

  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-xl ${SIZES[size]} ${VARIANTS[variant]} ${isDisabled ? "opacity-50" : ""} ${className}`}
      disabled={isDisabled}
      onPress={handlePress}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === "primary" || variant === "destructive" ? "#fff" : "#171717"} className="mr-2" />}
      <Text className={`text-sm font-semibold ${VARIANT_TEXT[variant]}`}>{children}</Text>
    </Pressable>
  );
}

import { View, type ViewProps } from "react-native";

export function Card({ className = "", children, ...props }: ViewProps) {
  return (
    <View className={`bg-white border border-neutral-200 rounded-2xl ${className}`} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ className = "", children, ...props }: ViewProps) {
  return (
    <View className={`p-4 ${className}`} {...props}>
      {children}
    </View>
  );
}

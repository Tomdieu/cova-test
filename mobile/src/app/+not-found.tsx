import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">404</Text>
      <Text className="text-sm text-neutral-500 mt-2">Page not found</Text>
      <Link href="/" className="mt-4">
        <Text className="text-sm text-blue-600">Go home</Text>
      </Link>
    </View>
  );
}

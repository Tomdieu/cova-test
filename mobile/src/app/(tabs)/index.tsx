import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TaskList } from "@/components/task-list";

export default function DashboardTab() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-50" style={{ paddingTop: insets.top, paddingLeft: insets.left, paddingBottom: insets.bottom, paddingRight: insets.right }}>
      <TaskList />
    </View>
  );
}

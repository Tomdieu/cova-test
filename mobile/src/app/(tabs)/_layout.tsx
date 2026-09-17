import { NativeTabs } from "expo-router/unstable-native-tabs";

const blue = "#2563eb";

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={blue} backgroundColor="#ffffff">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "checklist", selected: "checklist" }}
          md="checklist"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-task">
        <NativeTabs.Trigger.Label>New Task</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          md="add_circle"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person", selected: "person.fill" }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

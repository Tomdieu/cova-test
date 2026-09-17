import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useSession } from "@/auth/ctx";
import { LogOut, Mail, AtSign, User } from "lucide-react-native";

export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();

  const initials = user
    ? (user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") || user.username[0].toUpperCase()
    : "?";

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username ?? "—";

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="items-center pt-8 pb-6 px-4">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text className="text-xl font-semibold text-neutral-900 mt-4">{displayName}</Text>
        {user?.username && (
          <Text className="text-sm text-neutral-500 mt-1">@{user.username}</Text>
        )}
      </View>

      {/* Account section */}
      <View className="px-4">
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.group}>
          <InfoRow
            icon={<User size={18} className="text-neutral-500" />}
            label="Name"
            value={displayName}
          />
          <InfoRow
            icon={<AtSign size={18} className="text-neutral-500" />}
            label="Username"
            value={user?.username ?? "—"}
          />
          <InfoRow
            icon={<Mail size={18} className="text-neutral-500" />}
            label="Email"
            value={user?.email ?? "—"}
            last
          />
        </View>
      </View>

      {/* Sign out */}
      <View className="px-4 mt-8">
        <Text style={styles.sectionLabel}>SESSION</Text>
        <Pressable
          style={styles.signOutRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            signOut();
          }}
        >
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#a3a3a3",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 15,
    color: "#171717",
  },
  rowValue: {
    fontSize: 15,
    color: "#737373",
    maxWidth: 200,
    textAlign: "right",
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fecaca",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#dc2626",
  },
});

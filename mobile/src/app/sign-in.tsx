import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useSession } from "@/auth/ctx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Toast from "react-native-toast-message";

type Mode = "login" | "register";

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Welcome back!" });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formGroup}>
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        required
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        secure
        autoCapitalize="none"
        error={errors.password}
        required
      />
      <Button onPress={handleSubmit} loading={loading}>
        Sign in
      </Button>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onSwitch();
        }}
        style={styles.switchRow}
      >
        <Text style={styles.switchText}>
          Don&apos;t have an account?{" "}
          <Text style={styles.switchLink}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { signUp } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({
        username: username.trim(),
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Account created!" });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formGroup}>
      <View style={styles.row}>
        <View style={styles.halfField}>
          <Input
            label="First name"
            placeholder="Tomdieu"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            error={errors.firstName}
            required
          />
        </View>
        <View style={styles.halfField}>
          <Input
            label="Last name"
            placeholder="ivan"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            error={errors.lastName}
            required
          />
        </View>
      </View>
      <Input
        label="Username"
        placeholder="ivantom"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
        }}
        autoCapitalize="none"
        error={errors.username}
        required
      />
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        required
      />
      <Input
        label="Password"
        placeholder="Min. 8 characters"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        secure
        autoCapitalize="none"
        error={errors.password}
        required
      />
      <Button onPress={handleSubmit} loading={loading}>
        Create account
      </Button>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onSwitch();
        }}
        style={styles.switchRow}
      >
        <Text style={styles.switchText}>
          Already have an account?{" "}
          <Text style={styles.switchLink}>Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>("login");

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.branding}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <Text style={styles.brandTitle}>Cova Task</Text>
          <Text style={styles.brandSubtitle}>
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabBar}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setMode("login");
              }}
              style={[styles.tab, mode === "login" && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setMode("register");
              }}
              style={[styles.tab, mode === "register" && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
                Sign up
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          {mode === "login" ? (
            <LoginForm onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  branding: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#171717",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    color: "#737373",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e5e5",
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#737373",
  },
  tabTextActive: {
    color: "#171717",
  },
  formGroup: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    alignItems: "center",
    paddingTop: 4,
  },
  switchText: {
    fontSize: 14,
    color: "#737373",
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
  },
});

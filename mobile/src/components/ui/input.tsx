import { forwardRef, useState } from "react";
import { TextInput, View, Text, Pressable, StyleSheet, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  secure?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, secure, style, required, ...props }, ref) => {
    const [hidden, setHidden] = useState(secure);

    return (
      <View className="gap-1.5">
        {label && (
          <Text className="text-sm font-medium text-neutral-700">
            {label}
            {required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}
        <View
          className="flex-row items-center rounded-xl bg-white px-3.5"
          style={error ? styles.inputError : styles.inputDefault}
        >
          <TextInput
            ref={ref}
            className="flex-1 py-3 text-base text-neutral-900"
            placeholderTextColor="#a3a3a3"
            secureTextEntry={hidden}
            {...props}
          />
          {secure && (
            <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
              {hidden ? (
                <Eye size={18} className="text-neutral-400" />
              ) : (
                <EyeOff size={18} className="text-neutral-400" />
              )}
            </Pressable>
          )}
        </View>
        {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputDefault: { borderWidth: 1, borderColor: "#d4d4d8" },
  inputError: { borderWidth: 1, borderColor: "#ef4444" },
});

Input.displayName = "Input";

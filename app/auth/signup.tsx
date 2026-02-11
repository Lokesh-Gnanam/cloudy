import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, AtSign, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [privateId, setPrivateId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!name || !email || !privateId || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!privateId.startsWith("@")) {
      Alert.alert("Error", "Private ID must start with @");
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, name, privateId);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, "#1A1A2E"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Cloudy and connect privately
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <AtSign size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Private ID (e.g., @yourname)"
                  placeholderTextColor={Colors.textTertiary}
                  value={privateId}
                  onChangeText={(text) =>
                    setPrivateId(text.startsWith("@") ? text : "@" + text)
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Mail size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Your Private ID is how others find you. Keep it secret or
                  share it only with trusted people.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.text} />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  header: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: Colors.primary + "15",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  signupButton: {
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 8,
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  termsText: {
    textAlign: "center",
    color: Colors.textTertiary,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});

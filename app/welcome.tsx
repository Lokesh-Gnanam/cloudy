import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Lock, Shield, Eye, Users } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logo}>
            <Lock size={48} color={Colors.primary} />
            <Text style={styles.logoText}>Cloudy</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Private Messaging</Text>
            <Text style={styles.subtitle}>
              End-to-end encrypted conversations with complete privacy
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Shield size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Encrypted</Text>
                <Text style={styles.featureDesc}>
                  Messages are encrypted end-to-end
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Users size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Private IDs</Text>
                <Text style={styles.featureDesc}>
                  Use Private IDs instead of phone numbers
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Eye size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Vanish Mode</Text>
                <Text style={styles.featureDesc}>
                  Messages disappear after being read
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push("/auth/signup")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 12,
  },
  section: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  buttons: {
    gap: 12,
    paddingBottom: 20,
  },
  signupButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
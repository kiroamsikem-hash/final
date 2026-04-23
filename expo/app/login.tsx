import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Lock, User, Eye, EyeOff, Clock, Shield } from "lucide-react-native";
import { loginUser, authService } from "../lib/auth";
import { LinearGradient } from "expo-linear-gradient";
import { toast, ToastContainer } from "../components/Toast";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      const msg = "Kullanıcı adı ve şifre gerekli!";
      if (Platform.OS === "web") {
        toast.error(msg);
      } else {
        Alert.alert("Hata", msg);
      }
      return;
    }

    setLoading(true);

    try {
      const user = await authService.login(username, password);
      console.log("✅ Login successful, user:", user);
      
      if (Platform.OS === "web") {
        toast.success("Giriş başarılı!");
        // Small delay to show toast
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        // For mobile, just navigate - auth listener will handle the redirect
        router.replace("/");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const msg = (error as Error).message || "Giriş yapılırken hata oluştu!";
      if (Platform.OS === "web") {
        toast.error(msg);
      } else {
        Alert.alert("Hata", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ToastContainer />
      <LinearGradient
        colors={["#0f0f10", "#1a1520", "#0f0f10"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <View style={styles.logoBadge}>
                      <Clock size={40} color="#c9a227" strokeWidth={2.5} />
                    </View>
                    <View style={styles.logoGlow} />
                  </View>
                  <Text style={styles.title}>Western Anatolia</Text>
                  <View style={styles.divider} />
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputLabel}>
                      <User size={16} color="#c9a227" />
                      <Text style={styles.labelText}>Kullanıcı Adı</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Kullanıcı adınızı girin"
                        placeholderTextColor="#555"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputLabel}>
                      <Lock size={16} color="#c9a227" />
                      <Text style={styles.labelText}>Şifre</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Şifrenizi girin"
                        placeholderTextColor="#555"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#777" />
                        ) : (
                          <Eye size={20} color="#777" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#c9a227", "#d4b040", "#c9a227"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      <Shield size={20} color="#1a1a1a" />
                      <Text style={styles.loginButtonText}>
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Batı Anadolu Kronolojisi • 2024
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 56,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 24,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "rgba(26, 26, 29, 0.8)",
    borderWidth: 2,
    borderColor: "#c9a227",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#c9a227",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "#c9a227",
    opacity: 0.15,
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#c9a227",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: "#c9a227",
    borderRadius: 2,
    marginTop: 8,
  },
  form: {
    gap: 24,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 4,
  },
  labelText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 29, 0.6)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2a2a2e",
    paddingHorizontal: 18,
    height: 58,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: 14,
    height: 58,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#c9a227",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loginButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

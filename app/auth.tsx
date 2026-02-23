import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { FloatingIcons } from "@/components/auth/FloatingIcons";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useAuthContext } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/use-theme-color";

import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// Precisa ser chamado na tela que recebe o redirect do OAuth
WebBrowser.maybeCompleteAuthSession();
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type AuthState = "onboarding" | "login" | "signup";

export default function AuthScreen() {
  const [authState, setAuthState] = useState<AuthState>("onboarding");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { signIn, signUp, signInWithGoogle, signInWithApple, loading } = useAuthContext();

  const logoTextColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardColor = useThemeColor({}, "card");
  const subtitleColor = useThemeColor({}, "subtitle");

  const cardTranslateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    cardTranslateY.value = withSpring(0, { damping: 50, stiffness: 150 });
  }, [cardTranslateY]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (generalError) setGeneralError(null);
  };

  const handleSignIn = async () => {
    try {
      setGeneralError(null);
      await signIn(formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (error: any) {
      setGeneralError(error.message || "Erro ao entrar");
    }
  };

  const handleSignUp = async () => {
    try {
      setGeneralError(null);
      await signUp(formData.email, formData.password, formData.name);
      const onboardingCompleted = await AsyncStorage.getItem(
        "revy_onboarding_completed",
      );
      if (onboardingCompleted === "true") {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding" as any);
      }
    } catch (error: any) {
      setGeneralError(error.message || "Erro ao criar conta");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGeneralError(null);
      await signInWithGoogle();
    } catch (error: any) {
      setGeneralError(error.message || "Erro ao entrar com Google");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setGeneralError(null);
      await signInWithApple();
    } catch (error: any) {
      setGeneralError(error.message || "Erro ao entrar com Apple");
    }
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      <View style={[styles.dot, { backgroundColor: tintColor, width: 20 }]} />
      <View style={styles.dot} />
    </View>
  );

  const renderSocialAuth = () => (
    <View style={styles.socialContainer}>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={[styles.dividerText, { color: logoTextColor }]}>
          {authState === "login" ? "Ou entre com" : "Ou cadastre-se com"}
        </Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialButtonsRow}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#2A2A2A" }]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <FontAwesome name="google" size={24} color="#EA4335" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: "#2A2A2A" }]}
          onPress={handleAppleSignIn}
          disabled={loading}
        >
          <FontAwesome name="apple" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (authState === "onboarding") {
      return (
        <View style={styles.header}>
          <Text style={[styles.logoText, { color: textColor }]}>Revvy</Text>
          {renderPagination()}
        </View>
      );
    }

    return (
      <View style={styles.headerWithNav}>
        <TouchableOpacity onPress={() => setAuthState("onboarding")}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={[styles.logoTextSmall, { color: textColor }]}>Revvy</Text>
        <TouchableOpacity
          style={styles.headerPill}
          onPress={() =>
            setAuthState(authState === "login" ? "signup" : "login")
          }
        >
          <Text style={[styles.headerPillText, { color: tintColor }]}>
            {authState === "login"
              ? "Não tenho uma conta"
              : "Entrar com minha conta"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMainCard = () => {
    switch (authState) {
      case "onboarding":
        return (
          <Animated.View
            entering={FadeInDown.delay(10)}
            key="onboarding-card"
            style={styles.cardContent}
          >
            <FloatingIcons />
            <View style={styles.onboardingTextContainer}>
              <Text style={[styles.smallLabel, { color: subtitleColor }]}>
                REVVY
              </Text>
              <Text style={[styles.headline, { color: textColor }]}>
                Tome o controle de todos os seus veículos
              </Text>
            </View>
            <AuthButton
              label="Entrar"
              variant="primary"
              onPress={() => setAuthState("login")}
              style={styles.fullWidthButton}
            />
          </Animated.View>
        );
      case "login":
        return (
          <Animated.View
            entering={FadeInLeft}
            key="login-card"
            style={styles.cardContent}
          >
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Bem vindo de volta
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
              Entre na sua garagem para continuar
            </Text>

            <View style={styles.form}>
              <AuthInput
                label="Email"
                placeholder="driver@revvy.com"
                value={formData.email}
                onChangeText={(val) => handleInputChange("email", val)}
                keyboardType="email-address"
              />
              <PasswordInput
                label="Senha"
                placeholder="Digite sua senha"
                value={formData.password}
                onChangeText={(val) => handleInputChange("password", val)}
              />

              <TouchableOpacity
                onPress={() => {}}
                style={styles.forgotPassword}
              >
                <Text
                  style={[styles.forgotPasswordText, { color: subtitleColor }]}
                >
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>

              <AuthButton
                label="Entrar"
                onPress={handleSignIn}
                loading={loading}
              />
            </View>

            {renderSocialAuth()}
          </Animated.View>
        );
      case "signup":
        return (
          <Animated.View
            entering={FadeInRight}
            key="signup-card"
            style={styles.cardContent}
          >
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Comece a usar o Revvy.
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]}>
              É grátis.
            </Text>

            <View style={styles.form}>
              <AuthInput
                label="Email"
                placeholder="driver@revvy.com"
                value={formData.email}
                onChangeText={(val) => handleInputChange("email", val)}
                keyboardType="email-address"
              />
              <AuthInput
                label="Seu nome"
                placeholder="Seu nome completo"
                value={formData.name}
                onChangeText={(val) => handleInputChange("name", val)}
              />
              <View>
                <PasswordInput
                  label="Senha"
                  placeholder="Crie uma senha"
                  value={formData.password}
                  onChangeText={(val) => handleInputChange("password", val)}
                />
                {formData.password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: Math.min(formData.password.length * 10, 100),
                          backgroundColor:
                            formData.password.length > 8
                              ? "#4CAF50"
                              : "#FFC107",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.strengthText,
                        {
                          color:
                            formData.password.length > 8
                              ? "#4CAF50"
                              : "#FFC107",
                        },
                      ]}
                    >
                      {formData.password.length > 8 ? "Forte" : "Fraca"}
                    </Text>
                  </View>
                )}
              </View>

              <AuthButton
                label="Criar conta"
                onPress={handleSignUp}
                loading={loading}
              />
            </View>

            {renderSocialAuth()}
          </Animated.View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.headerContainer}>{renderHeader()}</View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cardColor },
            animatedCardStyle,
          ]}
        >
          {generalError && (
            <View style={styles.errorWrapper}>
              <ErrorMessage message={generalError} />
            </View>
          )}
          {renderMainCard()}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: SCREEN_HEIGHT * 0.3,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
  },
  headerWithNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: 82,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: -2,
  },
  logoTextSmall: {
    fontSize: 20,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  cardContent: {
    flex: 1,
  },
  onboardingTextContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 32,
  },
  fullWidthButton: {
    marginTop: "auto",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  socialContainer: {
    marginTop: "auto",
    paddingTop: 32,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "500",
  },
  socialButtonsRow: {
    flexDirection: "row",
    gap: 16,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  errorWrapper: {
    marginBottom: 16,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginRight: 10,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

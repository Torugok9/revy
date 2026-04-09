import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatLimitBanner } from "@/components/chat/ChatLimitBanner";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useChat } from "@/hooks/useChat";
import { useChatLimit } from "@/hooks/useChatLimit";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    sessionId: string;
    vehicleId: string;
  }>();

  const sessionId = params.sessionId;
  const vehicleId = params.vehicleId || "";

  const { messages, loading, sending, error, sendMessage } = useChat(
    sessionId,
    vehicleId,
  );
  const { used, limit, isAtLimit } = useChatLimit();
  const flatListRef = useRef<FlatList>(null);

  const showWarning = limit !== null && used >= limit * 0.8 && !isAtLimit;

  const handleSend = async (message: string) => {
    const result = await sendMessage(message);
    if (result?.session_id && result.session_id !== sessionId) {
      // Session was just created — replace route silently
      router.replace(
        `/chat/${result.session_id}?vehicleId=${vehicleId}` as any,
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Assistente Mecânico
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Warning banner */}
      {showWarning && limit !== null && (
        <ChatLimitBanner used={used} limit={limit} isAtLimit={false} />
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.flex,
            ]}
            ListFooterComponent={sending ? <ChatTypingIndicator /> : null}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input or limit block */}
        {isAtLimit && limit !== null ? (
          <ChatLimitBanner used={used} limit={limit} isAtLimit={true} />
        ) : (
          <View style={{ paddingBottom: insets.bottom }}>
            <ChatInput
              onSend={handleSend}
              disabled={isAtLimit}
              loading={sending}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContent: {
    paddingVertical: Spacing.lg,
  },
  errorBanner: {
    position: "absolute",
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.dark.danger,
    borderRadius: 8,
    padding: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

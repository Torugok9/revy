import { Colors, Fonts } from "@/constants/theme";
import type { ChatMessage } from "@/types/chat";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AssistantAvatar } from "./AssistantAvatar";

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && <AssistantAvatar />}
      <View style={styles.content}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text
            style={[
              styles.text,
              isUser ? styles.textUser : styles.textAssistant,
            ]}
          >
            {message.content}
          </Text>
        </View>
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.timestampUser : styles.timestampAssistant,
          ]}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  content: {
    maxWidth: "80%",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: Colors.dark.primary,
    maxWidth: "100%",
  },
  bubbleAssistant: {
    backgroundColor: "#1C1C1E",
    maxWidth: "100%",
  },
  text: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    lineHeight: Fonts.size.base * Fonts.lineHeight.relaxed,
  },
  textUser: {
    color: "#FFFFFF",
  },
  textAssistant: {
    color: "#F5F5F5",
  },
  timestamp: {
    fontFamily: Fonts.family.regular,
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  timestampUser: {
    textAlign: "right",
  },
  timestampAssistant: {
    textAlign: "left",
  },
});

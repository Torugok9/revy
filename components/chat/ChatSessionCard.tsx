import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import type { ChatSession } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ChatSessionCardProps {
  session: ChatSession;
  onPress: () => void;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ChatSessionCard({ session, onPress }: ChatSessionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="construct" size={18} color={Colors.dark.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {session.title || "Nova conversa"}
        </Text>
        <Text style={styles.date}>
          {formatRelativeDate(session.updated_at)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.md,
    color: Colors.dark.text,
  },
  date: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: "#6B7280",
  },
});

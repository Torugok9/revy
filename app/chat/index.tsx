import { ChatSessionCard } from "@/components/chat/ChatSessionCard";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useVehicles } from "@/hooks/useVehicles";
import { Vehicle } from "@/types/vehicle";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ── Vehicle Picker Item ─────────────────────────────────────────────── */

function VehiclePickerItem({
  vehicle,
  onSelect,
}: {
  vehicle: Vehicle;
  onSelect: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onSelect(vehicle.id)}
      style={({ pressed }) => [
        pickerStyles.item,
        pressed && pickerStyles.itemPressed,
      ]}
    >
      <View style={pickerStyles.thumb}>
        {vehicle.photo_url ? (
          <Image
            source={{ uri: vehicle.photo_url }}
            style={pickerStyles.thumbImage}
            contentFit="cover"
          />
        ) : (
          <Ionicons
            name="car-sport-outline"
            size={24}
            color={Colors.dark.textMuted}
          />
        )}
      </View>
      <View style={pickerStyles.info}>
        <Text style={pickerStyles.name} numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={pickerStyles.detail}>
          {vehicle.year} • {vehicle.plate.toUpperCase()}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.dark.textMuted}
      />
    </Pressable>
  );
}

const pickerStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  itemPressed: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.bg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  thumbImage: {
    width: 48,
    height: 48,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  detail: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});

/* ── Vehicle Picker Modal ────────────────────────────────────────────── */

function VehiclePickerModal({
  visible,
  vehicles,
  loading,
  onSelect,
  onClose,
}: {
  visible: boolean;
  vehicles: Vehicle[];
  loading: boolean;
  onSelect: (vehicleId: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.handle} />
        <Text style={modalStyles.title}>Escolha um veículo</Text>
        <Text style={modalStyles.subtitle}>
          Selecione o carro para iniciar a conversa
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.dark.primary}
            style={{ marginVertical: Spacing["2xl"] }}
          />
        ) : vehicles.length === 0 ? (
          <View style={modalStyles.emptyContainer}>
            <Ionicons
              name="car-outline"
              size={40}
              color={Colors.dark.textMuted}
            />
            <Text style={modalStyles.emptyText}>
              Nenhum veículo cadastrado
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VehiclePickerItem vehicle={item} onSelect={onSelect} />
            )}
            contentContainerStyle={modalStyles.list}
            ItemSeparatorComponent={() => (
              <View style={{ height: Spacing.sm }} />
            )}
            style={modalStyles.flatList}
          />
        )}
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["4xl"],
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.borderStrong,
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  list: {
    paddingBottom: Spacing.lg,
  },
  flatList: {
    flexGrow: 0,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
});

/* ── Main Screen ─────────────────────────────────────────────────────── */

export default function ChatSessionsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const { sessions, loading, refetch } = useChatSessions(vehicleId);
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleNewChat = () => {
    if (vehicleId) {
      router.push(`/chat/new?vehicleId=${vehicleId}`);
    } else {
      setPickerVisible(true);
    }
  };

  const handleVehicleSelected = (selectedVehicleId: string) => {
    setPickerVisible(false);
    router.push(`/chat/new?vehicleId=${selectedVehicleId}`);
  };

  const handleOpenSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    const vid = vehicleId || session?.vehicle_id || "";
    router.push(`/chat/${sessionId}?vehicleId=${vid}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Assistente Mecânico</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={Colors.dark.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>Tire dúvidas sobre seu carro</Text>
          <Text style={styles.emptySubtitle}>
            Converse com o Revy, seu assistente mecânico com I.A.
          </Text>
          <Pressable
            onPress={handleNewChat}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.startButtonText}>Iniciar conversa</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={loading}
          renderItem={({ item }) => (
            <ChatSessionCard
              session={item}
              onPress={() => handleOpenSession(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      {sessions.length > 0 && (
        <Pressable
          onPress={handleNewChat}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
            { bottom: insets.bottom + 24 },
          ]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Vehicle Picker Modal */}
      <VehiclePickerModal
        visible={pickerVisible}
        vehicles={vehicles}
        loading={vehiclesLoading}
        onSelect={handleVehicleSelected}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  startButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  startButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: "#FFFFFF",
  },
  listContent: {
    padding: Spacing.lg,
  },
  separator: {
    height: Spacing.md,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

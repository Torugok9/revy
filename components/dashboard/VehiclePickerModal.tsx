import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Vehicle } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface VehiclePickerModalProps {
  visible: boolean;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelect: (vehicle: Vehicle) => void;
  onClose: () => void;
}

export function VehiclePickerModal({
  visible,
  vehicles,
  selectedVehicleId,
  onSelect,
  onClose,
}: VehiclePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <View style={styles.handle} />
          <Text style={styles.title}>Selecionar Veículo</Text>

          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedVehicleId;
              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.vehicleItem,
                    isSelected && styles.vehicleItemSelected,
                    pressed && styles.vehicleItemPressed,
                  ]}
                >
                  <View style={styles.vehicleImageContainer}>
                    {item.photo_url ? (
                      <Image
                        source={{ uri: item.photo_url }}
                        style={styles.vehicleImage}
                        contentFit="cover"
                      />
                    ) : (
                      <Ionicons
                        name="car-sport"
                        size={22}
                        color={Colors.dark.textSecondary}
                      />
                    )}
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {item.brand} {item.model}
                    </Text>
                    <Text style={styles.vehicleDetails}>
                      {item.year} - {item.plate.toUpperCase()}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.dark.primary}
                    />
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={styles.list}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    paddingBottom: Spacing["4xl"],
    maxHeight: "60%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.dark.borderStrong,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  vehicleItemSelected: {
    backgroundColor: Colors.dark.surface,
  },
  vehicleItemPressed: {
    opacity: 0.7,
  },
  vehicleImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  vehicleImage: {
    width: 44,
    height: 44,
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleName: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  vehicleDetails: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionMenu({ onEdit, onDelete }: ActionMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit();
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete();
  };

  return (
    <>
      {/* Botão de Menu */}
      <Pressable
        onPress={() => setMenuVisible(true)}
        style={({ pressed }) => [
          styles.menuButton,
          pressed && styles.menuButtonPressed,
        ]}
      >
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={Colors.dark.text}
        />
      </Pressable>

      {/* Modal Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {/* Opção: Editar */}
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={Colors.dark.text}
                style={styles.menuIcon}
              />
              <Text style={styles.menuItemText}>Editar veículo</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Opção: Excluir */}
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name="trash"
                size={16}
                color={Colors.dark.danger}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                Excluir veículo
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  menuButtonPressed: {
    backgroundColor: Colors.dark.border,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 50,
  },
  menuContainer: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.lg,
    marginLeft: "auto",
    marginTop: Spacing.lg,
    minWidth: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuItemPressed: {
    backgroundColor: Colors.dark.border,
  },
  menuIcon: {
    marginRight: Spacing.md,
  },
  menuItemText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  menuItemDanger: {
    color: Colors.dark.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
  },
});

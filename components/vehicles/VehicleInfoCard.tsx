import React from "react";
import {
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Vehicle } from "@/types/vehicle";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface VehicleInfoCardProps {
  vehicle: Vehicle;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number | null | undefined): string {
  if (!value) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "";
  return km.toLocaleString("pt-BR") + " km";
}

export function VehicleInfoCard({ vehicle }: VehicleInfoCardProps) {
  const infoRows = [
    {
      label: "Placa",
      value: vehicle.plate.toUpperCase(),
      show: true,
    },
    {
      label: "Quilometragem",
      value: formatKm(vehicle.current_km),
      show: true,
      isPrimary: true,
    },
    {
      label: "Cor",
      value: vehicle.color || "",
      show: !!vehicle.color,
    },
    {
      label: "Chassis",
      value: vehicle.chassis_number || "",
      show: !!vehicle.chassis_number,
    },
    {
      label: "Data de compra",
      value: formatDate(vehicle.purchase_date),
      show: !!vehicle.purchase_date,
    },
    {
      label: "Valor de compra",
      value: formatCurrency(vehicle.purchase_value),
      show: !!vehicle.purchase_value,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {infoRows.map(
          (row, index) =>
            row.show && (
              <View key={index}>
                <View style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text
                    style={[
                      styles.value,
                      row.isPrimary && styles.valuePrimary,
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
                {index < infoRows.filter((r) => r.show).length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            )
        )}
      </View>

      {vehicle.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observações</Text>
          <Text style={styles.notesText}>{vehicle.notes}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  label: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  value: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  valuePrimary: {
    fontFamily: Fonts.family.semibold,
    color: Colors.dark.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  notesContainer: {
    marginTop: Spacing.lg,
  },
  notesLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  notesText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    lineHeight: Fonts.lineHeight.relaxed,
  },
});

import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Colors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface FinancialSummaryProps {
  totalCost: number;
  count: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function FinancialSummary({
  totalCost,
  count,
}: FinancialSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Total Gasto */}
        <View style={styles.item}>
          <Text style={styles.label}>Total gasto</Text>
          <Text style={styles.value}>{formatCurrency(totalCost)}</Text>
        </View>

        {/* Manutenções */}
        <View style={styles.item}>
          <Text style={styles.label}>Manutenções</Text>
          <Text style={styles.value}>{count}</Text>
        </View>
      </View>
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
    flexDirection: "row",
  },
  item: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  value: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xl,
    color: Colors.dark.text,
  },
});

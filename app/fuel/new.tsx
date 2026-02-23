import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useFuel } from "@/hooks/useFuel";
import { useVehicle } from "@/hooks/useVehicle";
import type { FuelType } from "@/types/fuel";
import { FUEL_TYPE_COLORS, FUEL_TYPE_LABELS } from "@/types/fuel";
import { cleanCurrency, cleanDate, cleanKilometers } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getTodayFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateToISO(dateStr: string): string {
  const clean = cleanDate(dateStr);
  if (clean.length !== 8) return dateStr;
  const day = clean.substring(0, 2);
  const month = clean.substring(2, 4);
  const year = clean.substring(4, 8);
  return `${year}-${month}-${day}`;
}

function formatKmDisplay(km: number | null | undefined): string {
  if (km === null || km === undefined) return "N/A";
  return km.toLocaleString("pt-BR") + " km";
}

function parseDecimal(value: string): number {
  const clean = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

function formatDecimalForInput(value: number): string {
  if (value <= 0) return "";
  return value.toFixed(2).replace(".", ",");
}

interface FuelFormData {
  fuelType: FuelType | "";
  liters: string;
  pricePerLiter: string;
  totalCost: string;
  kmAtFillup: string;
  date: string;
  fullTank: boolean;
  stationName: string;
  notes: string;
}

const INITIAL_FORM: FuelFormData = {
  fuelType: "",
  liters: "",
  pricePerLiter: "",
  totalCost: "",
  kmAtFillup: "",
  date: getTodayFormatted(),
  fullTank: true,
  stationName: "",
  notes: "",
};

const FUEL_OPTIONS: {
  value: FuelType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    value: "gasoline",
    label: "Gasolina",
    icon: "water-outline",
    color: FUEL_TYPE_COLORS.gasoline,
  },
  {
    value: "gasoline_ad",
    label: "Gasolina Adit.",
    icon: "water-outline",
    color: FUEL_TYPE_COLORS.gasoline_ad,
  },
  {
    value: "ethanol",
    label: "Etanol",
    icon: "leaf-outline",
    color: FUEL_TYPE_COLORS.ethanol,
  },
  {
    value: "diesel",
    label: "Diesel",
    icon: "flash-outline",
    color: FUEL_TYPE_COLORS.diesel,
  },
  {
    value: "diesel_s10",
    label: "Diesel S-10",
    icon: "flash-outline",
    color: FUEL_TYPE_COLORS.diesel_s10,
  },
  {
    value: "gnv",
    label: "GNV",
    icon: "cloudy-outline",
    color: FUEL_TYPE_COLORS.gnv,
  },
];

export default function NewFuelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;
  const insets = useSafeAreaInsets();

  const { vehicle } = useVehicle(vehicleId);
  const { addFuelLog } = useFuel(vehicleId);

  const [formData, setFormData] = useState<FuelFormData>(INITIAL_FORM);
  const [kmError, setKmError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const lastEditedField = useRef<"liters" | "price" | "total" | null>(null);

  const litersRef = useRef<RNTextInput>(null);
  const priceRef = useRef<RNTextInput>(null);
  const totalRef = useRef<RNTextInput>(null);
  const kmRef = useRef<RNTextInput>(null);
  const dateRef = useRef<RNTextInput>(null);
  const stationRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  const currentKm = vehicle?.current_km ?? 0;

  const updateField = useCallback(
    (field: keyof FuelFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const recalculate = useCallback(
    (
      data: FuelFormData,
      changed: "liters" | "price" | "total",
    ): FuelFormData => {
      const liters = parseDecimal(data.liters);
      const price = parseDecimal(data.pricePerLiter);
      const total = parseDecimal(data.totalCost);

      if (changed === "liters") {
        if (liters > 0 && price > 0) {
          return {
            ...data,
            totalCost: formatDecimalForInput(liters * price),
          };
        }
        if (liters > 0 && total > 0) {
          return {
            ...data,
            pricePerLiter: formatDecimalForInput(total / liters),
          };
        }
      }

      if (changed === "price") {
        if (price > 0 && liters > 0) {
          return {
            ...data,
            totalCost: formatDecimalForInput(liters * price),
          };
        }
        if (price > 0 && total > 0) {
          return { ...data, liters: formatDecimalForInput(total / price) };
        }
      }

      if (changed === "total") {
        if (total > 0 && liters > 0) {
          return {
            ...data,
            pricePerLiter: formatDecimalForInput(total / liters),
          };
        }
        if (total > 0 && price > 0) {
          return { ...data, liters: formatDecimalForInput(total / price) };
        }
      }

      return data;
    },
    [],
  );

  const handleLitersChange = useCallback(
    (val: string) => {
      lastEditedField.current = "liters";
      setFormData((prev) => recalculate({ ...prev, liters: val }, "liters"));
    },
    [recalculate],
  );

  const handlePriceChange = useCallback(
    (val: string) => {
      lastEditedField.current = "price";
      setFormData((prev) =>
        recalculate({ ...prev, pricePerLiter: val }, "price"),
      );
    },
    [recalculate],
  );

  const handleTotalChange = useCallback(
    (val: string) => {
      lastEditedField.current = "total";
      setFormData((prev) => recalculate({ ...prev, totalCost: val }, "total"));
    },
    [recalculate],
  );

  const isFormValid = useMemo(() => {
    const hasType = formData.fuelType !== "";
    const liters = parseDecimal(formData.liters);
    const price = parseDecimal(formData.pricePerLiter);
    const total = parseDecimal(formData.totalCost);
    const hasDate = formData.date.length === 10;

    return hasType && liters > 0 && price > 0 && total > 0 && hasDate;
  }, [formData]);

  const handleSave = async () => {
    if (!isFormValid || !vehicleId) return;

    setIsLoading(true);
    setKmError("");

    try {
      const liters = parseDecimal(formData.liters);
      const pricePerLiter = parseDecimal(formData.pricePerLiter);
      const totalCost = parseDecimal(formData.totalCost);
      const kmValue = formData.kmAtFillup
        ? parseInt(cleanKilometers(formData.kmAtFillup), 10)
        : undefined;

      if (kmValue && currentKm && kmValue < currentKm) {
        setKmError(
          `Km não pode ser menor que a atual (${formatKmDisplay(currentKm)}).`,
        );
        setIsLoading(false);
        return;
      }

      const success = await addFuelLog({
        vehicle_id: vehicleId,
        fuel_type: formData.fuelType as FuelType,
        liters,
        price_per_liter: pricePerLiter,
        total_cost: totalCost,
        km_at_fillup: kmValue,
        full_tank: formData.fullTank,
        date: parseDateToISO(formData.date),
        station_name: formData.stationName.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      if (success) {
        router.back();
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível registrar o abastecimento. Tente novamente.",
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o abastecimento.";
      Alert.alert("Erro", message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (name: keyof typeof Ionicons.glyphMap) => (
    <Ionicons name={name} size={20} color={Colors.dark.textSecondary} />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Registrar Abastecimento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vehicle Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleCardIcon}>
            <Ionicons
              name="car-outline"
              size={24}
              color={Colors.dark.primary}
            />
          </View>
          <View style={styles.vehicleCardInfo}>
            <Text style={styles.vehicleCardLabel}>REGISTRANDO PARA</Text>
            <Text style={styles.vehicleCardName}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Carregando..."}
            </Text>
          </View>
          <View style={styles.currentKmBadge}>
            <Text style={styles.currentKmText}>
              {formatKmDisplay(vehicle?.current_km)}
            </Text>
          </View>
        </View>

        {/* Fuel Type Selector */}
        <Text style={styles.sectionHeader}>TIPO DE COMBUSTÍVEL</Text>

        <View style={styles.typeGrid}>
          {FUEL_OPTIONS.map((option) => {
            const isSelected = formData.fuelType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => updateField("fuelType", option.value)}
                style={[
                  styles.typeButton,
                  isSelected && {
                    borderColor: option.color,
                    backgroundColor: option.color + "15",
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? option.color : Colors.dark.textSecondary}
                />
                <Text
                  style={[
                    styles.typeButtonLabel,
                    isSelected && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Fuel Data */}
        <Text style={styles.sectionHeader}>DADOS DO ABASTECIMENTO</Text>

        <View style={styles.fieldsContainer}>
          <View style={styles.rowFields}>
            <MaskedVehicleInput
              ref={litersRef}
              label="Litros"
              placeholder="0,00"
              value={formData.liters}
              onChangeText={handleLitersChange}
              maskType="currency"
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
              required
              showValidation={formData.liters.length > 0}
              containerStyle={styles.halfField}
              icon={renderIcon("water-outline")}
            />
            <MaskedVehicleInput
              ref={priceRef}
              label="Preço/litro"
              placeholder="0,00"
              value={formData.pricePerLiter}
              onChangeText={handlePriceChange}
              maskType="currency"
              returnKeyType="next"
              onSubmitEditing={() => totalRef.current?.focus()}
              required
              showValidation={formData.pricePerLiter.length > 0}
              containerStyle={styles.halfField}
              icon={renderIcon("pricetag-outline")}
            />
          </View>

          <MaskedVehicleInput
            ref={totalRef}
            label="Total pago"
            placeholder="0,00"
            value={formData.totalCost}
            onChangeText={handleTotalChange}
            maskType="currency"
            returnKeyType="next"
            onSubmitEditing={() => kmRef.current?.focus()}
            required
            showValidation={formData.totalCost.length > 0}
            icon={renderIcon("cash-outline")}
          />
        </View>

        {/* Additional Info */}
        <Text style={styles.sectionHeader}>INFORMAÇÕES ADICIONAIS</Text>

        <View style={styles.fieldsContainer}>
          <View style={styles.rowFields}>
            <MaskedVehicleInput
              ref={kmRef}
              label="Quilometragem"
              placeholder="0"
              value={formData.kmAtFillup}
              onChangeText={(v) => {
                updateField("kmAtFillup", v);
                setKmError("");
              }}
              maskType="kilometers"
              returnKeyType="next"
              onSubmitEditing={() => dateRef.current?.focus()}
              containerStyle={styles.halfField}
              icon={renderIcon("speedometer-outline")}
              error={kmError}
            />
            <MaskedVehicleInput
              ref={dateRef}
              label="Data"
              placeholder="DD/MM/AAAA"
              value={formData.date}
              onChangeText={(v) => updateField("date", v)}
              maskType="date"
              returnKeyType="next"
              onSubmitEditing={() => stationRef.current?.focus()}
              required
              showValidation={formData.date.length > 0}
              containerStyle={styles.halfField}
              icon={renderIcon("calendar-outline")}
            />
          </View>

          {/* Full Tank Toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Tanque cheio</Text>
              <Text style={styles.switchHint}>
                Marque para calcular km/l com precisão
              </Text>
            </View>
            <Switch
              value={formData.fullTank}
              onValueChange={(v) => updateField("fullTank", v)}
              trackColor={{
                false: Colors.dark.border,
                true: Colors.dark.primary + "80",
              }}
              thumbColor={
                formData.fullTank ? Colors.dark.primary : Colors.dark.textMuted
              }
            />
          </View>

          <MaskedVehicleInput
            ref={stationRef}
            label="Posto"
            placeholder="Ex: Shell Centro"
            value={formData.stationName}
            onChangeText={(v) => updateField("stationName", v)}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
            icon={renderIcon("location-outline")}
          />

          <MaskedVehicleInput
            ref={notesRef}
            label="Observação"
            placeholder="Notas adicionais..."
            value={formData.notes}
            onChangeText={(v) => updateField("notes", v)}
            multiline
            numberOfLines={3}
            returnKeyType="done"
            style={styles.inputMultiline}
            icon={renderIcon("chatbox-outline")}
          />
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
          style={({ pressed }) => [
            styles.saveButton,
            (!isFormValid || isLoading) && styles.saveButtonDisabled,
            pressed && isFormValid && { opacity: 0.9 },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.text} size="small" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={Colors.dark.text}
              />
              <Text style={styles.saveButtonText}>Salvar Abastecimento</Text>
            </View>
          )}
        </Pressable>

        <View style={{ height: Spacing["3xl"] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  vehicleCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  vehicleCardInfo: {
    flex: 1,
  },
  vehicleCardLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  vehicleCardName: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  currentKmBadge: {
    backgroundColor: Colors.dark.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  currentKmText: {
    fontFamily: Fonts.family.bold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.primary,
  },
  sectionHeader: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  typeButtonLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
  },
  fieldsContainer: {
    gap: Spacing.lg,
  },
  rowFields: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  switchInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  switchHint: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["3xl"],
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
});

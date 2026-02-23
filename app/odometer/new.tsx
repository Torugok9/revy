import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useOdometer } from "@/hooks/useOdometer";
import { useVehicle } from "@/hooks/useVehicle";
import { cleanDate, cleanKilometers } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
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

export default function NewOdometerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;
  const insets = useSafeAreaInsets();

  const { vehicle } = useVehicle(vehicleId);
  const { addLog } = useOdometer(vehicleId);

  const [km, setKm] = useState("");
  const [date, setDate] = useState(getTodayFormatted());
  const [notes, setNotes] = useState("");
  const [kmError, setKmError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dateRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  const currentKm = vehicle?.current_km ?? 0;

  const isFormValid = useCallback(() => {
    const cleanedKm = cleanKilometers(km);
    const kmValue = Number(cleanedKm);
    return cleanedKm.length > 0 && !isNaN(kmValue) && kmValue > 0 && date.length === 10;
  }, [km, date]);

  const handleSave = async () => {
    if (!vehicleId) return;

    const cleanedKm = cleanKilometers(km);
    const kmValue = Number(cleanedKm);

    if (!cleanedKm || isNaN(kmValue) || kmValue <= 0) {
      setKmError("Informe uma quilometragem válida.");
      return;
    }

    if (currentKm && kmValue < currentKm) {
      setKmError(
        `A km não pode ser menor que a atual (${formatKmDisplay(currentKm)}).`,
      );
      return;
    }

    setIsLoading(true);
    setKmError("");

    try {
      const success = await addLog({
        vehicle_id: vehicleId,
        km: kmValue,
        date: parseDateToISO(date),
        notes: notes.trim() || undefined,
      });

      if (success) {
        router.back();
      } else {
        Alert.alert("Erro", "Não foi possível registrar a quilometragem. Tente novamente.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível registrar a quilometragem.";
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
        <Text style={styles.headerTitle}>Registrar Quilometragem</Text>
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

        {/* KM Input */}
        <Text style={styles.sectionHeader}>QUILOMETRAGEM ATUAL</Text>

        <MaskedVehicleInput
          label="Quilometragem"
          placeholder="Ex: 45.000"
          value={km}
          onChangeText={(val) => {
            setKm(val);
            setKmError("");
          }}
          maskType="kilometers"
          returnKeyType="next"
          onSubmitEditing={() => dateRef.current?.focus()}
          required
          showValidation={km.length > 0}
          error={kmError}
          icon={renderIcon("speedometer-outline")}
        />

        {/* Date & Notes */}
        <Text style={styles.sectionHeader}>DETALHES</Text>

        <View style={styles.fieldsContainer}>
          <MaskedVehicleInput
            ref={dateRef}
            label="Data"
            placeholder="DD/MM/AAAA"
            value={date}
            onChangeText={setDate}
            maskType="date"
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
            required
            showValidation={date.length > 0}
            icon={renderIcon("calendar-outline")}
          />

          <MaskedVehicleInput
            ref={notesRef}
            label="Observação"
            placeholder="Ex: Saída para viagem SP-RJ"
            value={notes}
            onChangeText={setNotes}
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
          disabled={!isFormValid() || isLoading}
          style={({ pressed }) => [
            styles.saveButton,
            (!isFormValid() || isLoading) && styles.saveButtonDisabled,
            pressed && isFormValid() && { opacity: 0.9 },
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
              <Text style={styles.saveButtonText}>Salvar Registro</Text>
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
  fieldsContainer: {
    gap: Spacing.lg,
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

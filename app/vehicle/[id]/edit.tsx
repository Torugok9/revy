import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useVehicle } from "@/hooks/useVehicle";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface FormErrors {
  brand?: string;
  model?: string;
  year?: string;
  plate?: string;
  current_km?: string;
}

export default function VehicleEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.id as string;

  const {
    vehicle,
    loading: vehicleLoading,
    error: vehicleError,
  } = useVehicle(vehicleId);
  const { maintenances } = useMaintenances(vehicleId);

  // Form State
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [color, setColor] = useState("");
  const [current_km, setCurrentKm] = useState("");
  const [chassis_number, setChassisNumber] = useState("");
  const [purchase_date, setPurchaseDate] = useState("");
  const [purchase_value, setPurchaseValue] = useState("");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastMaintenanceKm, setLastMaintenanceKm] = useState<number | null>(
    null,
  );

  // Preencher formulário quando veículo carrega
  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year.toString());
      setPlate(vehicle.plate);
      setColor(vehicle.color || "");
      setCurrentKm(vehicle.current_km?.toString() || "");
      setChassisNumber(vehicle.chassis_number || "");
      setPurchaseDate(vehicle.purchase_date || "");
      setPurchaseValue(vehicle.purchase_value?.toString() || "");
      setNotes(vehicle.notes || "");

      // Encontrar última manutenção
      if (maintenances.length > 0) {
        const lastMaintenance = maintenances[0];
        if (lastMaintenance.km_at_maintenance) {
          setLastMaintenanceKm(lastMaintenance.km_at_maintenance);
        }
      }
    }
  }, [vehicle, maintenances]);

  // Detectar mudanças
  useEffect(() => {
    if (!vehicle) return;

    const changed =
      brand !== vehicle.brand ||
      model !== vehicle.model ||
      year !== vehicle.year.toString() ||
      plate !== vehicle.plate ||
      color !== (vehicle.color || "") ||
      current_km !== (vehicle.current_km?.toString() || "") ||
      chassis_number !== (vehicle.chassis_number || "") ||
      purchase_date !== (vehicle.purchase_date || "") ||
      purchase_value !== (vehicle.purchase_value?.toString() || "") ||
      notes !== (vehicle.notes || "");

    setHasChanges(changed);
  }, [
    brand,
    model,
    year,
    plate,
    color,
    current_km,
    chassis_number,
    purchase_date,
    purchase_value,
    notes,
    vehicle,
  ]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!brand.trim()) {
      newErrors.brand = "Marca é obrigatória";
    }

    if (!model.trim()) {
      newErrors.model = "Modelo é obrigatório";
    }

    if (!year.trim()) {
      newErrors.year = "Ano é obrigatório";
    } else {
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
        newErrors.year = `Ano deve estar entre 1900 e ${currentYear + 1}`;
      }
    }

    if (!plate.trim()) {
      newErrors.plate = "Placa é obrigatória";
    }

    if (current_km && lastMaintenanceKm) {
      const kmNum = parseInt(current_km, 10);
      if (kmNum < lastMaintenanceKm) {
        newErrors.current_km = `Quilometragem não pode ser menor que a última manutenção (${lastMaintenanceKm.toLocaleString("pt-BR")} km)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        brand,
        model,
        year: parseInt(year, 10),
        plate: plate.toUpperCase(),
        color: color || null,
        current_km: current_km ? parseInt(current_km, 10) : null,
        chassis_number: chassis_number || null,
        purchase_date: purchase_date || null,
        purchase_value: purchase_value
          ? parseFloat(purchase_value.replace(",", "."))
          : null,
        notes: notes || null,
      };

      const { error } = await supabase
        .from("vehicles")
        .update(updateData)
        .eq("id", vehicleId);

      if (error) {
        throw new Error(error.message || "Erro ao salvar veículo");
      }

      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao salvar veículo";
      console.error("handleSave error:", err);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (vehicleLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {vehicleError || "Veículo não encontrado"}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Text style={styles.headerButtonText}>Cancelar</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Editar veículo</Text>

        <Pressable
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          style={({ pressed }) => [
            styles.saveButton,
            (!hasChanges || isLoading) && styles.saveButtonDisabled,
            pressed && styles.saveButtonPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.primary} size="small" />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                (!hasChanges || isLoading) && styles.saveButtonTextDisabled,
              ]}
            >
              Salvar
            </Text>
          )}
        </Pressable>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Marca */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Marca *</Text>
          <TextInput
            style={[styles.input, errors.brand && styles.inputError]}
            placeholder="Toyota"
            placeholderTextColor={Colors.dark.textMuted}
            value={brand}
            onChangeText={setBrand}
            editable={!isLoading}
          />
          {errors.brand && (
            <Text style={styles.errorMessage}>{errors.brand}</Text>
          )}
        </View>

        {/* Modelo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Modelo *</Text>
          <TextInput
            style={[styles.input, errors.model && styles.inputError]}
            placeholder="Corolla"
            placeholderTextColor={Colors.dark.textMuted}
            value={model}
            onChangeText={setModel}
            editable={!isLoading}
          />
          {errors.model && (
            <Text style={styles.errorMessage}>{errors.model}</Text>
          )}
        </View>

        {/* Ano */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ano *</Text>
          <TextInput
            style={[styles.input, errors.year && styles.inputError]}
            placeholder="2022"
            placeholderTextColor={Colors.dark.textMuted}
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            editable={!isLoading}
          />
          {errors.year && (
            <Text style={styles.errorMessage}>{errors.year}</Text>
          )}
        </View>

        {/* Placa */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Placa *</Text>
          <TextInput
            style={[styles.input, errors.plate && styles.inputError]}
            placeholder="ABC-1D23"
            placeholderTextColor={Colors.dark.textMuted}
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
            editable={!isLoading}
          />
          {errors.plate && (
            <Text style={styles.errorMessage}>{errors.plate}</Text>
          )}
        </View>

        {/* Cor */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Cor</Text>
          <TextInput
            style={styles.input}
            placeholder="Branco"
            placeholderTextColor={Colors.dark.textMuted}
            value={color}
            onChangeText={setColor}
            editable={!isLoading}
          />
        </View>

        {/* Quilometragem */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Quilometragem atual</Text>
          <TextInput
            style={[styles.input, errors.current_km && styles.inputError]}
            placeholder="45230"
            placeholderTextColor={Colors.dark.textMuted}
            value={current_km}
            onChangeText={setCurrentKm}
            keyboardType="number-pad"
            editable={!isLoading}
          />
          {errors.current_km && (
            <Text style={styles.errorMessage}>{errors.current_km}</Text>
          )}
        </View>

        {/* Chassis */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Número do chassis</Text>
          <TextInput
            style={styles.input}
            placeholder="1G1FB1S96K1000000"
            placeholderTextColor={Colors.dark.textMuted}
            value={chassis_number}
            onChangeText={setChassisNumber}
            editable={!isLoading}
          />
        </View>

        {/* Data de compra */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data de compra</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={Colors.dark.textMuted}
            value={purchase_date}
            onChangeText={setPurchaseDate}
            editable={!isLoading}
          />
        </View>

        {/* Valor de compra */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor de compra</Text>
          <TextInput
            style={styles.input}
            placeholder="50000"
            placeholderTextColor={Colors.dark.textMuted}
            value={purchase_value}
            onChangeText={setPurchaseValue}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
        </View>

        {/* Observações */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Adicione notas sobre o veículo"
            placeholderTextColor={Colors.dark.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!isLoading}
          />
        </View>

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: Spacing.lg,
    paddingTop: Spacing["4xl"],
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
  headerButton: {
    padding: Spacing.sm,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  headerTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    padding: Spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.primary,
  },
  saveButtonTextDisabled: {
    color: Colors.dark.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.family.medium,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  inputError: {
    borderColor: Colors.dark.warning,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  errorMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.warning,
    marginTop: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
});

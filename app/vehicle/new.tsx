import { LimitReachedModal } from "@/components/vehicles/LimitReachedModal";
import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { StepIndicator } from "@/components/vehicles/StepIndicator";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/lib/supabase";
import { cleanCurrency, cleanKilometers, cleanPlate } from "@/utils/formatters";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VehicleFormData {
  // Step 1: Identificação
  brand: string;
  model: string;
  year: string;
  plate: string;

  // Step 2: Características
  color: string;
  currentKm: string;
  chassisNumber: string;

  // Step 3: Aquisição
  purchaseDate: string;
  purchaseValue: string;
  notes: string;
}

const STEPS = [
  {
    id: "identification",
    label: "Identificação",
    validate: (data: VehicleFormData) => {
      return !!(
        data.brand.trim() &&
        data.model.trim() &&
        data.year &&
        data.plate
      );
    },
    requiredFields: ["brand", "model", "year", "plate"],
  },
  {
    id: "characteristics",
    label: "Características",
    validate: () => true, // Todos os campos são opcionais neste step
    requiredFields: [],
  },
  {
    id: "acquisition",
    label: "Aquisição",
    validate: () => true, // Todos os campos são opcionais neste step
    requiredFields: [],
  },
];

export default function NewVehicleScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { plan } = useUserPlan();

  const form = useMultiStepForm<VehicleFormData>({
    steps: STEPS,
    initialData: {
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
      currentKm: "",
      chassisNumber: "",
      purchaseDate: "",
      purchaseValue: "",
      notes: "",
    },
    storageKey: "vehicle_form",
  });

  const [showLimitModal, setShowLimitModal] = React.useState(false);

  // Refs para navegação entre inputs
  const modelRef = useRef<RNTextInput>(null);
  const yearRef = useRef<RNTextInput>(null);
  const plateRef = useRef<RNTextInput>(null);
  const colorRef = useRef<RNTextInput>(null);
  const kmRef = useRef<RNTextInput>(null);
  const chassisRef = useRef<RNTextInput>(null);
  const dateRef = useRef<RNTextInput>(null);
  const valueRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  // Carregar progresso ao montar o componente
  useEffect(() => {
    form.loadProgress();
  }, []);

  // Salvar progresso quando os dados mudam
  useEffect(() => {
    const timeout = setTimeout(() => {
      form.saveProgress();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [form.formData, form.currentStep]);

  const handleSave = async () => {
    if (!form.isCurrentStepValid || !user) {
      return;
    }

    form.setIsLoading(true);
    try {
      const insertData = {
        brand: form.formData.brand.trim(),
        model: form.formData.model.trim(),
        year: parseInt(form.formData.year, 10),
        plate: cleanPlate(form.formData.plate),
        color: form.formData.color.trim() || null,
        current_km: form.formData.currentKm
          ? parseInt(cleanKilometers(form.formData.currentKm), 10)
          : 0,
        chassis_number: form.formData.chassisNumber.trim() || null,
        purchase_date: form.formData.purchaseDate.trim() || null,
        purchase_value: form.formData.purchaseValue
          ? parseFloat(cleanCurrency(form.formData.purchaseValue))
          : null,
        notes: form.formData.notes.trim() || null,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("vehicles")
        .insert(insertData)
        .select()
        .single();

      console.log("data: ", data);
      console.log("error: ", error);

      if (error) {
        // Verificar se é erro de limite
        if (
          error.message &&
          (error.message.toLowerCase().includes("limit") ||
            error.message.toLowerCase().includes("vehicle"))
        ) {
          setShowLimitModal(true);
          form.setIsLoading(false);
          return;
        }

        throw new Error(error.message || "Não foi possível salvar o veículo");
      }

      // Sucesso - limpar progresso salvo e voltar
      await form.clearProgress();
      form.setIsLoading(false);
      router.back();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o veículo. Tente novamente.";
      console.error("handleSave error:", err);
      alert(message);
      form.setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (form.goToNextStep()) {
      // Step avançou com sucesso
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          disabled={form.isLoading}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
        >
          <Text style={styles.headerButtonText}>Cancelar</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Novo veículo</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <StepIndicator
          currentStep={form.currentStep + 1}
          totalSteps={STEPS.length}
          stepLabel={form.currentStepInfo?.label}
        />
      </View>

      {/* Form Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Identificação */}
        {form.currentStep === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Identificação do Veículo</Text>
            <Text style={styles.stepDescription}>
              Informações essenciais para identificar seu veículo
            </Text>

            <View style={styles.fieldsContainer}>
              <MaskedVehicleInput
                label="Marca"
                placeholder="Ex: Toyota"
                value={form.formData.brand}
                onChangeText={(value) => form.updateField("brand", value)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => modelRef.current?.focus()}
                error={
                  form.stepErrors.brand
                    ? "Informe a marca do veículo"
                    : undefined
                }
                required
                showValidation={form.formData.brand.length > 0}
              />

              <MaskedVehicleInput
                ref={modelRef}
                label="Modelo"
                placeholder="Ex: Corolla"
                value={form.formData.model}
                onChangeText={(value) => form.updateField("model", value)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => yearRef.current?.focus()}
                error={
                  form.stepErrors.model
                    ? "Informe o modelo do veículo"
                    : undefined
                }
                required
                showValidation={form.formData.model.length > 0}
                containerStyle={styles.fieldSpacing}
              />

              <MaskedVehicleInput
                ref={yearRef}
                label="Ano"
                placeholder="Ex: 2022"
                value={form.formData.year}
                onChangeText={(value) => form.updateField("year", value)}
                maskType="year"
                maxLength={4}
                returnKeyType="next"
                onSubmitEditing={() => plateRef.current?.focus()}
                error={
                  form.stepErrors.year ? "Informe um ano válido" : undefined
                }
                required
                showValidation={form.formData.year.length > 0}
                containerStyle={styles.fieldSpacing}
              />

              <MaskedVehicleInput
                ref={plateRef}
                label="Placa"
                placeholder="Ex: ABC-1D23"
                value={form.formData.plate}
                onChangeText={(value) => form.updateField("plate", value)}
                maskType="plate"
                autoCapitalize="characters"
                returnKeyType="done"
                error={form.stepErrors.plate ? "Placa inválida" : undefined}
                required
                showValidation={form.formData.plate.length > 0}
                containerStyle={styles.fieldSpacing}
              />
            </View>
          </View>
        )}

        {/* Step 2: Características */}
        {form.currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Características do Veículo</Text>
            <Text style={styles.stepDescription}>
              Detalhes adicionais do seu veículo
            </Text>

            <View style={styles.fieldsContainer}>
              <MaskedVehicleInput
                ref={colorRef}
                label="Cor"
                placeholder="Ex: Prata"
                value={form.formData.color}
                onChangeText={(value) => form.updateField("color", value)}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => kmRef.current?.focus()}
              />

              <MaskedVehicleInput
                ref={kmRef}
                label="Quilometragem atual"
                placeholder="Ex: 45000"
                value={form.formData.currentKm}
                onChangeText={(value) => form.updateField("currentKm", value)}
                maskType="kilometers"
                returnKeyType="next"
                onSubmitEditing={() => chassisRef.current?.focus()}
                containerStyle={styles.fieldSpacing}
              />

              <MaskedVehicleInput
                ref={chassisRef}
                label="Número do chassis"
                placeholder="Ex: 9BRBLWHEXG0..."
                value={form.formData.chassisNumber}
                onChangeText={(value) =>
                  form.updateField("chassisNumber", value)
                }
                autoCapitalize="characters"
                returnKeyType="done"
                containerStyle={styles.fieldSpacing}
              />
            </View>
          </View>
        )}

        {/* Step 3: Aquisição */}
        {form.currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dados da Aquisição</Text>
            <Text style={styles.stepDescription}>
              Informações sobre a compra do veículo
            </Text>

            <View style={styles.fieldsContainer}>
              <MaskedVehicleInput
                ref={dateRef}
                label="Data de compra"
                placeholder="DD/MM/AAAA"
                value={form.formData.purchaseDate}
                onChangeText={(value) =>
                  form.updateField("purchaseDate", value)
                }
                maskType="date"
                returnKeyType="next"
                onSubmitEditing={() => valueRef.current?.focus()}
              />

              <MaskedVehicleInput
                ref={valueRef}
                label="Valor de compra"
                placeholder="Ex: 85000.00"
                value={form.formData.purchaseValue}
                onChangeText={(value) =>
                  form.updateField("purchaseValue", value)
                }
                maskType="currency"
                returnKeyType="next"
                onSubmitEditing={() => notesRef.current?.focus()}
                containerStyle={styles.fieldSpacing}
              />

              <MaskedVehicleInput
                ref={notesRef}
                label="Observações"
                placeholder="Anotações gerais sobre o veículo..."
                value={form.formData.notes}
                onChangeText={(value) => form.updateField("notes", value)}
                multiline
                numberOfLines={4}
                returnKeyType="done"
                onSubmitEditing={() => {}}
                style={styles.inputMultiline}
                containerStyle={styles.fieldSpacing}
              />
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {!form.isFirstStep && (
          <Pressable
            onPress={form.goToPreviousStep}
            disabled={form.isLoading}
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonSecondary,
              pressed && styles.navButtonPressed,
            ]}
          >
            <Text style={styles.navButtonTextSecondary}>← Voltar</Text>
          </Pressable>
        )}

        <Pressable
          onPress={form.isLastStep ? handleSave : handleNextStep}
          disabled={!form.isCurrentStepValid || form.isLoading}
          style={({ pressed }) => [
            styles.navButton,
            styles.navButtonPrimary,
            (!form.isCurrentStepValid || form.isLoading) &&
              styles.navButtonDisabled,
            pressed &&
              form.isCurrentStepValid &&
              styles.navButtonPrimaryPressed,
          ]}
        >
          {form.isLoading ? (
            <ActivityIndicator color={Colors.dark.primary} size="small" />
          ) : (
            <Text
              style={[
                styles.navButtonText,
                (!form.isCurrentStepValid || form.isLoading) &&
                  styles.navButtonTextDisabled,
              ]}
            >
              {form.isLastStep ? "Salvar" : "Próximo →"}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Modal de Limite Atingido */}
      <LimitReachedModal
        visible={showLimitModal}
        onClose={() => {
          setShowLimitModal(false);
          router.back();
        }}
        planName={plan?.name || "Free"}
        maxVehicles={plan?.max_vehicles || 1}
      />
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
  headerButton: {
    padding: Spacing.sm,
    minWidth: 60,
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
  },
  stepIndicatorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  stepContainer: {
    gap: Spacing.lg,
  },
  stepTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.lg,
    color: Colors.dark.text,
  },
  stepDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.base,
    color: Colors.dark.textSecondary,
  },
  fieldsContainer: {
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },
  fieldSpacing: {
    marginTop: Spacing.lg,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonPrimary: {
    backgroundColor: Colors.dark.primary,
  },
  navButtonSecondary: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonPressed: {
    opacity: 0.8,
  },
  navButtonPrimaryPressed: {
    opacity: 0.9,
  },
  navButtonText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
  },
  navButtonTextSecondary: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.primary,
  },
  navButtonTextDisabled: {
    color: Colors.dark.textSecondary,
  },
});

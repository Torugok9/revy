import { LimitReachedModal } from "@/components/vehicles/LimitReachedModal";
import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { supabase } from "@/lib/supabase";
import { cleanCurrency, cleanDate, cleanKilometers, cleanPlate } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
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

const STORAGE_KEY = "vehicle_form_v2";

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  plate: string;
  currentKm: string;
  color: string;
  chassisNumber: string;
  purchaseDate: string;
  purchaseValue: string;
  notes: string;
}

const INITIAL_FORM: VehicleFormData = {
  brand: "",
  model: "",
  year: "",
  plate: "",
  currentKm: "",
  color: "",
  chassisNumber: "",
  purchaseDate: "",
  purchaseValue: "",
  notes: "",
};

export default function NewVehicleScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { planId } = useUserPlan();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<VehicleFormData>(INITIAL_FORM);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Refs para navegação entre inputs
  const modelRef = useRef<RNTextInput>(null);
  const yearRef = useRef<RNTextInput>(null);
  const plateRef = useRef<RNTextInput>(null);
  const kmRef = useRef<RNTextInput>(null);
  const colorRef = useRef<RNTextInput>(null);
  const chassisRef = useRef<RNTextInput>(null);
  const dateRef = useRef<RNTextInput>(null);
  const valueRef = useRef<RNTextInput>(null);
  const notesRef = useRef<RNTextInput>(null);

  const updateField = useCallback(
    (field: keyof VehicleFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Validação: campos obrigatórios preenchidos
  const isFormValid =
    formData.brand.trim().length > 0 &&
    formData.model.trim().length > 0 &&
    formData.year.length === 4 &&
    formData.plate.length >= 7;

  // Salvar/carregar progresso
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.photoUri) setPhotoUri(parsed.photoUri);
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ formData, photoUri }),
        );
      } catch {}
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData, photoUri]);

  // Upload de foto
  const handlePickImage = useCallback(() => {
    const options = ["Tirar Foto", "Escolher da Galeria", "Cancelar"];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 2 },
        async (buttonIndex) => {
          if (buttonIndex === 0) await launchCamera();
          else if (buttonIndex === 1) await launchGallery();
        },
      );
    } else {
      Alert.alert("Foto do Veículo", "Como deseja adicionar a foto?", [
        { text: "Tirar Foto", onPress: launchCamera },
        { text: "Escolher da Galeria", onPress: launchGallery },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  }, []);

  const launchCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar fotos.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const launchGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à galeria para selecionar fotos.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Upload para Supabase Storage
  const uploadPhoto = async (vehicleId: string): Promise<string | null> => {
    if (!photoUri) return null;

    try {
      const ext = photoUri.split(".").pop() || "jpg";
      const fileName = `${vehicleId}.${ext}`;
      const filePath = `vehicles/${fileName}`;

      const response = await fetch(photoUri);
      const blob = await response.blob();

      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error } = await supabase.storage
        .from("vehicle-photos")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (error) {
        console.warn("Erro ao fazer upload da foto:", error.message);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("vehicle-photos").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.warn("Erro no upload da foto:", err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!isFormValid || !user) return;

    setIsLoading(true);
    try {
      // Converte DD/MM/YYYY → YYYY-MM-DD para o banco de dados
      let purchaseDateISO: string | null = null;
      if (formData.purchaseDate.trim()) {
        const cleaned = cleanDate(formData.purchaseDate);
        if (cleaned.length === 8) {
          const day = cleaned.substring(0, 2);
          const month = cleaned.substring(2, 4);
          const year = cleaned.substring(4, 8);
          purchaseDateISO = `${year}-${month}-${day}`;
        }
      }

      const insertData = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year, 10),
        plate: cleanPlate(formData.plate),
        color: formData.color.trim() || null,
        current_km: formData.currentKm
          ? parseInt(cleanKilometers(formData.currentKm), 10)
          : 0,
        chassis_number: formData.chassisNumber.trim() || null,
        purchase_date: purchaseDateISO,
        purchase_value: formData.purchaseValue
          ? parseFloat(cleanCurrency(formData.purchaseValue))
          : null,
        notes: formData.notes.trim() || null,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("vehicles")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        if (
          error.message &&
          (error.message.toLowerCase().includes("limit") ||
            error.message.toLowerCase().includes("vehicle"))
        ) {
          setShowLimitModal(true);
          setIsLoading(false);
          return;
        }
        throw new Error(error.message || "Não foi possível salvar o veículo");
      }

      // Upload da foto se existir
      if (data && photoUri) {
        const photoUrl = await uploadPhoto(data.id);
        if (photoUrl) {
          await supabase
            .from("vehicles")
            .update({ photo_url: photoUrl })
            .eq("id", data.id);
        }
      }

      await AsyncStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
      router.back();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o veículo. Tente novamente.";
      console.error("handleSave error:", err);
      alert(message);
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
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Adicionar Veículo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== FOTO DO VEÍCULO ===== */}
        <Text style={styles.sectionHeader}>FOTO DO VEÍCULO</Text>

        <Pressable onPress={handlePickImage} style={styles.photoSection}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.photoPreview}
              contentFit="cover"
            />
          ) : (
            <>
              <View style={styles.cameraIconCircle}>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={Colors.dark.primary}
                />
              </View>
              <Text style={styles.photoTitle}>Tirar ou escolher foto</Text>
              <Text style={styles.photoSubtitle}>
                Formatos aceitos: JPG, PNG
              </Text>
              <View style={styles.selectFileButton}>
                <Text style={styles.selectFileText}>Selecionar Arquivo</Text>
              </View>
            </>
          )}
        </Pressable>

        {/* ===== INFORMAÇÕES BÁSICAS ===== */}
        <Text style={styles.sectionHeader}>INFORMAÇÕES BÁSICAS</Text>

        <View style={styles.fieldsContainer}>
          <MaskedVehicleInput
            label="Marca"
            placeholder="Ex: Toyota, BMW, Honda"
            value={formData.brand}
            onChangeText={(v) => updateField("brand", v)}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => modelRef.current?.focus()}
            required
            showValidation={formData.brand.length > 0}
            icon={renderIcon("car-sport-outline")}
          />

          <MaskedVehicleInput
            ref={modelRef}
            label="Modelo"
            placeholder="Ex: Corolla, M3, Civic"
            value={formData.model}
            onChangeText={(v) => updateField("model", v)}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => yearRef.current?.focus()}
            required
            showValidation={formData.model.length > 0}
            icon={renderIcon("document-text-outline")}
          />

          <View style={styles.rowFields}>
            <MaskedVehicleInput
              ref={yearRef}
              label="Ano"
              placeholder="2024"
              value={formData.year}
              onChangeText={(v) => updateField("year", v)}
              maskType="year"
              maxLength={4}
              returnKeyType="next"
              onSubmitEditing={() => plateRef.current?.focus()}
              required
              showValidation={formData.year.length > 0}
              containerStyle={styles.halfField}
              icon={renderIcon("calendar-outline")}
            />
            <MaskedVehicleInput
              ref={plateRef}
              label="Placa"
              placeholder="ABC-1234"
              value={formData.plate}
              onChangeText={(v) => updateField("plate", v)}
              maskType="plate"
              autoCapitalize="characters"
              returnKeyType="next"
              onSubmitEditing={() => kmRef.current?.focus()}
              required
              showValidation={formData.plate.length > 0}
              containerStyle={styles.halfField}
              icon={renderIcon("pricetag-outline")}
            />
          </View>

          <MaskedVehicleInput
            ref={kmRef}
            label="Quilometragem Atual (km)"
            placeholder="0"
            value={formData.currentKm}
            onChangeText={(v) => updateField("currentKm", v)}
            maskType="kilometers"
            returnKeyType="next"
            onSubmitEditing={() => colorRef.current?.focus()}
            icon={renderIcon("speedometer-outline")}
          />
        </View>

        {/* ===== INFORMAÇÕES ADICIONAIS ===== */}
        <Text style={styles.sectionHeader}>INFORMAÇÕES ADICIONAIS</Text>

        <View style={styles.fieldsContainer}>
          <MaskedVehicleInput
            ref={colorRef}
            label="Cor"
            placeholder="Ex: Prata"
            value={formData.color}
            onChangeText={(v) => updateField("color", v)}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => chassisRef.current?.focus()}
            icon={renderIcon("color-palette-outline")}
          />

          <MaskedVehicleInput
            ref={chassisRef}
            label="Número do Chassi"
            placeholder="Ex: 9BRBLWHEXG0..."
            value={formData.chassisNumber}
            onChangeText={(v) => updateField("chassisNumber", v)}
            autoCapitalize="characters"
            returnKeyType="next"
            onSubmitEditing={() => dateRef.current?.focus()}
            icon={renderIcon("construct-outline")}
          />

          <MaskedVehicleInput
            ref={dateRef}
            label="Data de Compra"
            placeholder="DD/MM/AAAA"
            value={formData.purchaseDate}
            onChangeText={(v) => updateField("purchaseDate", v)}
            maskType="date"
            returnKeyType="next"
            onSubmitEditing={() => valueRef.current?.focus()}
            icon={renderIcon("calendar-outline")}
          />

          <MaskedVehicleInput
            ref={valueRef}
            label="Valor de Compra"
            placeholder="Ex: 85000.00"
            value={formData.purchaseValue}
            onChangeText={(v) => updateField("purchaseValue", v)}
            maskType="currency"
            returnKeyType="next"
            onSubmitEditing={() => notesRef.current?.focus()}
            icon={renderIcon("cash-outline")}
          />

          <MaskedVehicleInput
            ref={notesRef}
            label="Observações"
            placeholder="Anotações gerais sobre o veículo..."
            value={formData.notes}
            onChangeText={(v) => updateField("notes", v)}
            multiline
            numberOfLines={4}
            returnKeyType="done"
            style={styles.inputMultiline}
            icon={renderIcon("chatbox-outline")}
          />
        </View>

        {/* ===== BOTÃO SALVAR ===== */}
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
                name="save-outline"
                size={20}
                color={Colors.dark.text}
              />
              <Text style={styles.saveButtonText}>Salvar Veículo</Text>
            </View>
          )}
        </Pressable>

        <View style={{ height: Spacing["3xl"] }} />
      </ScrollView>

      {/* Modal de Limite */}
      <LimitReachedModal
        visible={showLimitModal}
        onClose={() => {
          setShowLimitModal(false);
          router.back();
        }}
        planName={planId === "free" ? "Free" : "Premium"}
        maxVehicles={planId === "free" ? 1 : 10}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  // Header
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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["2xl"],
  },

  // Section headers
  sectionHeader: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginTop: Spacing["2xl"],
  },

  // Photo section
  photoSection: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.dark.borderStrong,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  cameraIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  photoTitle: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.base,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  photoSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
  },
  selectFileButton: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.md,
  },
  selectFileText: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.sm,
    color: Colors.dark.text,
  },

  // Fields
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
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 100,
  },

  // Save button
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

import { FeatureGate } from "@/components/FeatureGate";
import { MaskedVehicleInput } from "@/components/vehicles/MaskedVehicleInput";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useVehicle } from "@/hooks/useVehicle";
import { supabase } from "@/lib/supabase";
import { MaintenanceType } from "@/types/vehicle";
import { cleanCurrency, cleanDate, cleanKilometers } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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

interface MaintenanceFormData {
  type: MaintenanceType | "";
  title: string;
  date: string;
  kmAtMaintenance: string;
  cost: string;
  description: string;
}

const INITIAL_FORM: MaintenanceFormData = {
  type: "",
  title: "",
  date: "",
  kmAtMaintenance: "",
  cost: "",
  description: "",
};

const TYPE_OPTIONS: {
  value: MaintenanceType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    value: "revision",
    label: "Revisão",
    icon: "refresh-outline",
    color: "#DC2626",
  },
  {
    value: "part_change",
    label: "Troca de Peça",
    icon: "swap-horizontal-outline",
    color: "#F59E0B",
  },
  { value: "repair", label: "Reparo", icon: "build-outline", color: "#3B82F6" },
  {
    value: "other",
    label: "Outros",
    icon: "ellipsis-horizontal-outline",
    color: "#737373",
  },
];

export default function NewMaintenanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;
  const insets = useSafeAreaInsets();

  const { vehicle } = useVehicle(vehicleId);

  const [formData, setFormData] = useState<MaintenanceFormData>(INITIAL_FORM);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const titleRef = useRef<RNTextInput>(null);
  const dateRef = useRef<RNTextInput>(null);
  const kmRef = useRef<RNTextInput>(null);
  const costRef = useRef<RNTextInput>(null);
  const descriptionRef = useRef<RNTextInput>(null);

  const updateField = useCallback(
    (field: keyof MaintenanceFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const isFormValid =
    formData.type !== "" &&
    formData.title.trim().length > 0 &&
    formData.date.length === 10;

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
      Alert.alert("Foto do Comprovante", "Como deseja adicionar a foto?", [
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
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (maintenanceId: string): Promise<string | null> => {
    if (!photoUri) return null;

    try {
      const ext = photoUri.split(".").pop() || "jpg";
      const fileName = `${maintenanceId}.${ext}`;
      const filePath = `maintenances/${fileName}`;

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
        if (__DEV__) console.warn("Erro ao fazer upload da foto:", error.message);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("vehicle-photos").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      if (__DEV__) console.warn("Erro no upload da foto:", err);
      return null;
    }
  };

  const parseDateToISO = (dateStr: string): string => {
    const clean = cleanDate(dateStr);
    if (clean.length !== 8) return dateStr;
    const day = clean.substring(0, 2);
    const month = clean.substring(2, 4);
    const year = clean.substring(4, 8);
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!isFormValid || !vehicleId) return;

    setIsLoading(true);
    try {
      const insertData: Record<string, unknown> = {
        vehicle_id: vehicleId,
        type: formData.type,
        title: formData.title.trim(),
        date: parseDateToISO(formData.date),
        km_at_maintenance: formData.kmAtMaintenance
          ? parseInt(cleanKilometers(formData.kmAtMaintenance), 10)
          : null,
        cost: formData.cost ? parseFloat(cleanCurrency(formData.cost)) : null,
        description: formData.description.trim() || null,
      };

      const { data, error } = await supabase
        .from("maintenances")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(
          error.message || "Não foi possível salvar a manutenção",
        );
      }

      if (data && photoUri) {
        const receiptUrl = await uploadPhoto(data.id);
        if (receiptUrl) {
          await supabase
            .from("maintenances")
            .update({ receipt_url: receiptUrl })
            .eq("id", data.id);
        }
      }

      setIsLoading(false);
      router.back();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a manutenção. Tente novamente.";
      if (__DEV__) console.error("handleSave error:", err);
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
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Histórico de Manutenção</Text>
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
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={Colors.dark.textSecondary}
          />
        </View>

        {/* Service Category */}
        <Text style={styles.sectionHeader}>CATEGORIA DO SERVIÇO</Text>

        <View style={styles.typeGrid}>
          {TYPE_OPTIONS.map((option) => {
            const isSelected = formData.type === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => updateField("type", option.value)}
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

        {/* Service Info */}
        <Text style={styles.sectionHeader}>INFORMAÇÕES DO SERVIÇO</Text>

        <View style={styles.fieldsContainer}>
          <MaskedVehicleInput
            ref={titleRef}
            label="Título"
            placeholder="Ex: Troca de óleo, Alinhamento"
            value={formData.title}
            onChangeText={(v) => updateField("title", v)}
            autoCapitalize="sentences"
            returnKeyType="next"
            onSubmitEditing={() => dateRef.current?.focus()}
            required
            showValidation={formData.title.length > 0}
            icon={renderIcon("document-text-outline")}
          />

          <MaskedVehicleInput
            ref={dateRef}
            label="Data do Serviço"
            placeholder="DD/MM/AAAA"
            value={formData.date}
            onChangeText={(v) => updateField("date", v)}
            maskType="date"
            returnKeyType="next"
            onSubmitEditing={() => kmRef.current?.focus()}
            required
            showValidation={formData.date.length > 0}
            icon={renderIcon("calendar-outline")}
          />

          <View style={styles.rowFields}>
            <MaskedVehicleInput
              ref={kmRef}
              label="Quilometragem (km)"
              placeholder="0"
              value={formData.kmAtMaintenance}
              onChangeText={(v) => updateField("kmAtMaintenance", v)}
              maskType="kilometers"
              returnKeyType="next"
              onSubmitEditing={() => costRef.current?.focus()}
              containerStyle={styles.halfField}
              icon={renderIcon("speedometer-outline")}
            />
            <MaskedVehicleInput
              ref={costRef}
              label="Custo Total"
              placeholder="0,00"
              value={formData.cost}
              onChangeText={(v) => updateField("cost", v)}
              maskType="currency"
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              containerStyle={styles.halfField}
              icon={renderIcon("cash-outline")}
            />
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.sectionHeader}>NOTAS E DETALHES</Text>

        <View style={styles.fieldsContainer}>
          <MaskedVehicleInput
            ref={descriptionRef}
            label="Descrição"
            placeholder="Mencione peças específicas ou detalhes do serviço..."
            value={formData.description}
            onChangeText={(v) => updateField("description", v)}
            multiline
            numberOfLines={4}
            returnKeyType="done"
            style={styles.inputMultiline}
            icon={renderIcon("chatbox-outline")}
          />
        </View>

        {/* Proof of Service */}
        <Text style={styles.sectionHeader}>COMPROVANTE</Text>

        <FeatureGate feature="receipt_photo" mode="action">
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
                <Text style={styles.photoTitle}>
                  Adicionar foto do comprovante
                </Text>
                <Text style={styles.photoSubtitle}>
                  Suporta JPG, PNG até 10MB
                </Text>
              </>
            )}
          </Pressable>
        </FeatureGate>

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
                name="save-outline"
                size={20}
                color={Colors.dark.text}
              />
              <Text style={styles.saveButtonText}>Salvar Manutenção</Text>
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
    paddingTop: Spacing.xl,
  },

  // Vehicle Card
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

  // Section headers
  sectionHeader: {
    fontFamily: Fonts.family.semibold,
    fontSize: Fonts.size.xs,
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
    marginTop: Spacing["2xl"],
  },

  // Type selector grid
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

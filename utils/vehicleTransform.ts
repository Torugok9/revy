/**
 * Transformação de dados de formulário para formato de banco de dados
 * Reutilizável em criar e editar veículos
 */

export interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  plate: string;
  color: string;
  currentKm: string;
  chassisNumber: string;
  purchaseDate: string;
  purchaseValue: string;
  notes: string;
}

export interface VehicleInsertData {
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string | null;
  current_km: number;
  chassis_number: string | null;
  purchase_date: string | null;
  purchase_value: number | null;
  notes: string | null;
}

export const transformVehicleFormData = (
  formData: VehicleFormData
): VehicleInsertData => ({
  brand: formData.brand.trim(),
  model: formData.model.trim(),
  year: parseInt(formData.year, 10),
  plate: formData.plate.toUpperCase().trim(),
  color: formData.color.trim() || null,
  current_km: formData.currentKm ? parseInt(formData.currentKm, 10) : 0,
  chassis_number: formData.chassisNumber.trim() || null,
  purchase_date: formData.purchaseDate.trim() || null,
  purchase_value: formData.purchaseValue
    ? parseFloat(formData.purchaseValue.replace(",", "."))
    : null,
  notes: formData.notes.trim() || null,
});

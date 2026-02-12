import { useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage" ;

interface StepConfig<T = Record<string, any>> {
  id: string;
  label: string;
  validate: (data: T) => boolean;
  requiredFields: string[];
}

interface UseMultiStepFormProps<T extends Record<string, any>> {
  steps: StepConfig<T>[];
  initialData?: Partial<T>;
  storageKey?: string;
}

export function useMultiStepForm<T extends Record<string, any>>({
  steps,
  initialData = {},
  storageKey,
}: UseMultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validar step atual
  const isCurrentStepValid = useMemo((): boolean => {
    const step = steps[currentStep];
    if (!step) return false;

    // Validar campos obrigatórios
    for (const field of step.requiredFields) {
      const value = formData[field as keyof T];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return false;
      }
    }

    // Executar validação customizada
    return step.validate(formData);
  }, [currentStep, formData, steps]);

  // Obter erros do step atual
  const stepErrors = useMemo(() => {
    const step = steps[currentStep];
    if (!step) return {};

    const stepErrs: Record<string, string> = {};

    for (const field of step.requiredFields) {
      if (errors[field]) {
        stepErrs[field] = errors[field];
      }
    }

    return stepErrs;
  }, [currentStep, errors, steps]);

  // Validar e ir para próximo step
  const goToNextStep = useCallback((): boolean => {
    if (!isCurrentStepValid) {
      return false;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return true;
    }

    return true;
  }, [currentStep, isCurrentStepValid, steps.length]);

  // Ir para step anterior
  const goToPreviousStep = useCallback((): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Ir para step específico
  const goToStep = useCallback((step: number): boolean => {
    if (step < 0 || step >= steps.length) {
      return false;
    }

    // Se indo para frente, valida todos os steps intermediários
    if (step > currentStep) {
      for (let i = currentStep; i < step; i++) {
        setCurrentStep(i);
        const stepConfig = steps[i];
        if (!stepConfig.validate(formData)) {
          return false;
        }
      }
    }

    setCurrentStep(step);
    return true;
  }, [currentStep, formData, steps]);

  // Atualizar dados do formulário
  const updateFormData = useCallback((newData: Partial<T>): void => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // Atualizar campo específico
  const updateField = useCallback(
    (field: keyof T, value: any): void => {
      updateFormData({ [field]: value } as Partial<T>);
      // Limpar erro do campo quando o usuário começa a editar
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [updateFormData, errors]
  );

  // Definir erros
  const setFieldErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  // Resetar formulário
  const resetForm = useCallback((): void => {
    setCurrentStep(0);
    setFormData(initialData as T);
    setErrors({});
  }, [initialData]);

  // Salvar progresso localmente
  const saveProgress = useCallback(async (): Promise<void> => {
    if (!storageKey) return;

    try {
      const progress = {
        currentStep,
        formData,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `${storageKey}_progress`,
        JSON.stringify(progress)
      );
    } catch (error) {
      console.error("Failed to save form progress:", error);
    }
  }, [currentStep, formData, storageKey]);

  // Carregar progresso salvo
  const loadProgress = useCallback(async (): Promise<boolean> => {
    if (!storageKey) return false;

    try {
      const progress = await AsyncStorage.getItem(`${storageKey}_progress`);
      if (progress) {
        const parsed = JSON.parse(progress);
        setCurrentStep(parsed.currentStep);
        setFormData(parsed.formData);
        return true;
      }
    } catch (error) {
      console.error("Failed to load form progress:", error);
    }

    return false;
  }, [storageKey]);

  // Limpar progresso salvo
  const clearProgress = useCallback(async (): Promise<void> => {
    if (!storageKey) return;

    try {
      await AsyncStorage.removeItem(`${storageKey}_progress`);
    } catch (error) {
      console.error("Failed to clear form progress:", error);
    }
  }, [storageKey]);

  // Obter informações do step atual
  const currentStepInfo = useMemo(() => {
    return steps[currentStep] || null;
  }, [currentStep, steps]);

  // Obter progresso em percentual
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);

  return {
    // Estado
    currentStep,
    formData,
    errors,
    isLoading,
    stepErrors,
    progress,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    isCurrentStepValid,
    currentStepInfo,

    // Métodos
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateFormData,
    updateField,
    setFieldErrors,
    setIsLoading,
    resetForm,
    saveProgress,
    loadProgress,
    clearProgress,
  };
}

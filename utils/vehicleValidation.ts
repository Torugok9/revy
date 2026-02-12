/**
 * Validações de formulário de veículo
 * Regras de negócio isoladas para facilitar testes e reutilização
 */

const MIN_YEAR = 1900;
const MAX_YEAR_OFFSET = 1; // Ano atual + 1

export const validateBrand = (brand: string): string | undefined => {
  if (!brand.trim()) {
    return "Informe a marca do veículo";
  }
};

export const validateModel = (model: string): string | undefined => {
  if (!model.trim()) {
    return "Informe o modelo do veículo";
  }
};

export const validateYear = (year: string): string | undefined => {
  if (!year.trim()) {
    return "Informe um ano válido";
  }

  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + MAX_YEAR_OFFSET;

  if (isNaN(yearNum) || yearNum < MIN_YEAR || yearNum > maxYear) {
    return "Informe um ano válido";
  }
};

export const validatePlate = (plate: string): string | undefined => {
  if (!plate.trim()) {
    return "Informe a placa do veículo";
  }
};

export const validateKm = (km: string): string | undefined => {
  if (km && isNaN(parseInt(km, 10))) {
    return "Valor inválido";
  }
};

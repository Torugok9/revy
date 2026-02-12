/**
 * Formatadores e validadores para inputs com máscara
 */

/**
 * Formata uma placa veicular
 * Suporta ambos os formatos: ABC-1234 (antigo) e ABC-1D23 (Mercosul)
 */
export function formatPlate(value: string): string {
  // Remove caracteres não alfanuméricos
  const clean = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  // Se tem menos de 3 caracteres, retorna como está
  if (clean.length <= 3) {
    return clean;
  }

  // Mercosul: 3 letras + 1 número + 2 letras + 2 números (ABC-1D23)
  if (clean.length >= 8) {
    return (
      clean.substring(0, 3) +
      "-" +
      clean.substring(3, 4) +
      clean.substring(4, 6) +
      clean.substring(6, 8)
    );
  }

  // Antigo: 3 letras + 4 números (ABC-1234)
  if (clean.length >= 4) {
    return clean.substring(0, 3) + "-" + clean.substring(3, 7);
  }

  return clean;
}

/**
 * Remove caracteres de formatação da placa
 */
export function cleanPlate(value: string): string {
  return value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/**
 * Valida se a placa tem formato válido
 */
export function isValidPlate(value: string): boolean {
  const clean = cleanPlate(value);
  // Deve ter 7 caracteres (3 letras + 4 números ou 3 letras + 1 número + 2 letras + 2 números)
  return clean.length === 7 || clean.length === 8;
}

/**
 * Formata data no padrão DD/MM/AAAA
 */
export function formatDate(value: string): string {
  const clean = value.replace(/[^0-9]/g, "");

  if (clean.length <= 2) {
    return clean;
  }

  if (clean.length <= 4) {
    return clean.substring(0, 2) + "/" + clean.substring(2, 4);
  }

  return (
    clean.substring(0, 2) +
    "/" +
    clean.substring(2, 4) +
    "/" +
    clean.substring(4, 8)
  );
}

/**
 * Remove caracteres de formatação da data
 */
export function cleanDate(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/**
 * Valida se a data tem formato válido e é uma data real
 */
export function isValidDate(value: string): boolean {
  const clean = cleanDate(value);

  if (clean.length !== 8) {
    return false;
  }

  const day = parseInt(clean.substring(0, 2), 10);
  const month = parseInt(clean.substring(2, 4), 10);
  const year = parseInt(clean.substring(4, 8), 10);

  // Validação básica
  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    return false;
  }

  // Validação de dias por mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Ajusta fevereiro em anos bissextos
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

/**
 * Formata valor monetário em BRL
 * Entrada: "8500000" → Saída: "R$ 85.000,00"
 */
export function formatCurrency(value: string): string {
  // Remove caracteres não numéricos exceto ponto e vírgula
  let clean = value.replace(/[^0-9.,]/g, "");

  // Se foi inserido com vírgula ou ponto, normaliza
  clean = clean.replace(",", ".");

  // Mantém apenas um ponto/vírgula decimal
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = parts.slice(0, -1).join("") + "." + parts[parts.length - 1];
  }

  // Se não tem parte decimal, adiciona dois zeros
  if (!clean.includes(".")) {
    clean = clean + ".00";
  } else {
    // Limita a 2 casas decimais
    const [integerPart, decimalPart] = clean.split(".");
    clean = integerPart + "." + decimalPart.substring(0, 2).padEnd(2, "0");
  }

  // Formata com separadores de milhar
  const [integerPart, decimalPart] = clean.split(".");
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `R$ ${formatted},${decimalPart}`;
}

/**
 * Remove caracteres de formatação do valor monetário
 * Entrada: "R$ 85.000,00" → Saída: "85000.00"
 */
export function cleanCurrency(value: string): string {
  // Remove R$ e espaços
  let clean = value.replace(/R\$\s*/g, "");

  // Troca ponto por vazio (separador de milhar)
  clean = clean.replace(/\./g, "");

  // Troca vírgula por ponto (separador decimal)
  clean = clean.replace(",", ".");

  return clean;
}

/**
 * Valida valor monetário
 */
export function isValidCurrency(value: string): boolean {
  const clean = cleanCurrency(value);
  const num = parseFloat(clean);
  return !isNaN(num) && num > 0;
}

/**
 * Formata quilometragem
 * Entrada: "45000" → Saída: "45.000 km"
 */
export function formatKilometers(value: string): string {
  const clean = value.replace(/[^0-9]/g, "");

  if (clean.length === 0) {
    return "";
  }

  const num = parseInt(clean, 10);
  const formatted = num.toLocaleString("pt-BR");

  return `${formatted} km`;
}

/**
 * Remove caracteres de formatação da quilometragem
 */
export function cleanKilometers(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

/**
 * Valida quilometragem
 */
export function isValidKilometers(value: string): boolean {
  const clean = cleanKilometers(value);

  if (clean.length === 0) {
    return true; // Campo opcional
  }

  const num = parseInt(clean, 10);
  return !isNaN(num) && num >= 0 && num <= 9999999;
}

/**
 * Valida número do chassis
 */
export function isValidChassis(value: string): boolean {
  // Chassis deve ter 17 caracteres (VIN - Vehicle Identification Number)
  // Mas aqui vamos ser flexíveis e aceitar entre 10-20 caracteres
  const clean = value.trim();
  return clean.length === 0 || (clean.length >= 10 && clean.length <= 20);
}

/**
 * Valida ano do veículo
 */
export function isValidYear(value: string): boolean {
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();

  return !isNaN(year) && year >= 1900 && year <= currentYear + 1;
}

/**
 * Formata texto para sentença (primeira letra maiúscula)
 */
export function formatText(value: string): string {
  return value
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

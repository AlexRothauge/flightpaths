type ValidationResult = boolean | string;

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export const numberRule = [
  (v: number): ValidationResult => isNonNullable(v) || "Geben Sie eine gültige Zahl ein.",
  (v: number): ValidationResult => v > 0 || "Eingabe muss größer als 0 sein.",
];
export const latValidation = [
  (v: number): ValidationResult => isNonNullable(v) || "Geben Sie eine gültige Zahl ein.",
  (v: number): ValidationResult => (v > -90 && v < 90) || "Latitude muss zwischen -90 und 90 liegen.",
];

export const lonValidation = [
  (v: number): ValidationResult => isNonNullable(v) || "Geben Sie eine gültige Zahl ein.",
  (v: number): ValidationResult => (v > -180 && v < 180) || "Longitude muss zwischen -180 und 180 liegen.",
];


// Máscaras e validações comuns (BR)

export function maskCNPJ(value: string): string {
  if (!value) return "";
  const n = value.replace(/\D/g, "").slice(0, 14);
  return n
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isValidCNPJ(cnpj: string): boolean {
  const s = (cnpj || "").replace(/\D/g, "");
  if (s.length !== 14) return false;
  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(s)) return false;

  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * factor--;
      if (factor < 2) factor = 9;
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base = s.substring(0, 12);
  const d1 = calc(base, 5);
  const d2 = calc(base + d1, 6);
  return s.endsWith(String(d1) + String(d2));
}

export function maskPhone(value: string): string {
  if (!value) return "";
  const n = value.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) {
    return n
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return n
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function isValidPhone(phone: string): boolean {
  const s = (phone || "").replace(/\D/g, "");
  return s.length === 10 || s.length === 11;
}

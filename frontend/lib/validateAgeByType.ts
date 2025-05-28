// Utility to validate age constraints based on beneficiary type.

export function validateAgeByType(type: string, birthDateStr: string): string | null {
  if (!type || !birthDateStr) return null;

  const birthDate = new Date(birthDateStr);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  if (type === 'child' && (age < 5 || age > 17)) {
    return 'Un enfant doit avoir entre 5 et 17 ans.';
  }

  if (type === 'youth' && (age < 18 || age > 30)) {
    return 'Un jeune doit avoir entre 18 et 30 ans.';
  }

  const adultesOnly = [
    'teacher',
    'social_worker',
    'psychologist',
    'local_authority',
    'partner',
  ];
  if (adultesOnly.includes(type) && age < 18) {
    return `Le type "${type}" requiert un âge supérieur à 17 ans.`;
  }

  return null;
}
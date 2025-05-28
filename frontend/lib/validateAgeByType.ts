/**
 * Utility function to validate age constraints based on beneficiary type
 * 
 * This function checks if a beneficiary's age meets the requirements for their type:
 * - Children: 5-17 years old
 * - Youth: 18-30 years old
 * - Adults (teachers, social workers, etc.): 18+ years old
 * 
 * @param type - The beneficiary type to validate against
 * @param birthDateStr - The birth date string to calculate age from
 * @returns Error message if validation fails, null if validation passes
 */
export function validateAgeByType(type: string, birthDateStr: string): string | null {
  // Return null if required parameters are missing
  if (!type || !birthDateStr) return null;

  // Calculate age from birth date
  const birthDate = new Date(birthDateStr);
  const today = new Date();

  // Calculate age in years
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  // Validate age for children (5-17 years)
  if (type === 'child' && (age < 5 || age > 17)) {
    return 'Un enfant doit avoir entre 5 et 17 ans.';
  }

  // Validate age for youth (18-30 years)
  if (type === 'youth' && (age < 18 || age > 30)) {
    return 'Un jeune doit avoir entre 18 et 30 ans.';
  }

  // List of beneficiary types that require adult age (18+)
  const adultesOnly = [
    'teacher',           // Teachers
    'social_worker',     // Social workers
    'psychologist',      // Psychologists
    'local_authority',   // Local authorities
    'partner',          // Partners
  ];

  // Validate age for adult-only types
  if (adultesOnly.includes(type) && age < 18) {
    return `Le type "${type}" requiert un âge supérieur à 17 ans.`;
  }

  // Return null if all validations pass
  return null;
}
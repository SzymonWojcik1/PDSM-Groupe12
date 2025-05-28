import axios from 'axios';

// =======================
// Types for API resources
// =======================

// Beneficiaire model based on backend validation/controller
export interface Beneficiaire {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
  ben_region: string;
  ben_pays: string;
  ben_type: string;
  ben_type_autre?: string | null;
  ben_zone: string;
  ben_sexe: string;
  ben_sexe_autre?: string | null;
  ben_genre?: string | null;
  ben_genre_autre?: string | null;
  ben_ethnicite: string;
  created_at?: string;
  updated_at?: string;
}

// Type for creating a new beneficiaire (without id, created_at, updated_at)
export type BeneficiaireCreate = Omit<Beneficiaire, 'ben_id' | 'created_at' | 'updated_at'>;

// Type for updating a beneficiaire (all fields optional except id)
export type BeneficiaireUpdate = Partial<BeneficiaireCreate>;

// Activity model based on backend controller
export interface Activity {
  act_id: string;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  act_part_id: string;
  act_pro_id: string;
  created_at?: string;
  updated_at?: string;
}

// Type for creating a new activity (without id, created_at, updated_at)
export type ActivityCreate = Omit<Activity, 'act_id' | 'created_at' | 'updated_at'>;

// Type for updating an activity (all fields optional except id)
export type ActivityUpdate = Partial<ActivityCreate>;

// Interface for checking duplicate beneficiaire
export interface BeneficiaireDuplicateCheck {
  ben_nom: string;
  ben_prenom: string;
  ben_date_naissance: string;
  ben_sexe: string;
}

// =======================
// Axios instance
// =======================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =======================
// Beneficiaire API Calls
// =======================

/**
 * Fetch a list of beneficiaries, optionally filtered by search string.
 */
export async function fetchBeneficiaires(search?: string): Promise<Beneficiaire[]> {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const response = await api.get(`/beneficiaires?${params.toString()}`);
  return response.data as Beneficiaire[];
}

/**
 * Fetch a single beneficiary by ID.
 */
export async function getBeneficiaire(id: string): Promise<Beneficiaire> {
  const response = await api.get(`/beneficiaires/${id}`);
  return response.data as Beneficiaire;
}

/**
 * Create a new beneficiary.
 */
export async function createBeneficiaire(data: BeneficiaireCreate): Promise<Beneficiaire> {
  const response = await api.post('/beneficiaires', data);
  return response.data as Beneficiaire;
}

/**
 * Update an existing beneficiary by ID.
 */
export async function updateBeneficiaire(id: string, data: BeneficiaireUpdate): Promise<Beneficiaire> {
  const response = await api.put(`/beneficiaires/${id}`, data);
  return response.data as Beneficiaire;
}

/**
 * Delete a beneficiary by ID.
 */
export async function deleteBeneficiaire(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/beneficiaires/${id}`);
  return response.data as { message: string };
}

/**
 * Check for duplicate beneficiary based on name, surname, birth date, and sex.
 */
export async function checkBeneficiaireDuplicate(
  data: BeneficiaireDuplicateCheck
): Promise<{ exists: boolean; beneficiaire?: { id: string; nom: string; prenom: string; created_at: string } }> {
  const response = await api.post('/beneficiaires/check-duplicate', data);
  return response.data as { exists: boolean; beneficiaire?: { id: string; nom: string; prenom: string; created_at: string } };
}

// =======================
// Enums API Call
// =======================

/**
 * Fetch all enums (types, zones, etc.) for dropdowns and validation.
 */
export async function fetchEnums() {
  const response = await api.get('/enums');
  return response.data;
}

// =======================
// Activity API Calls
// =======================

/**
 * Fetch all activities.
 */
export async function getAllActivities(): Promise<Activity[]> {
  const response = await api.get('/activites');
  return response.data as Activity[];
}

/**
 * Fetch a single activity by ID.
 */
export async function getActivityById(id: string): Promise<Activity> {
  const response = await api.get(`/activites/${id}`);
  return response.data as Activity;
}

/**
 * Create a new activity.
 */
export async function createActivity(data: ActivityCreate): Promise<Activity> {
  const response = await api.post('/activites', data);
  return response.data as Activity;
}

/**
 * Update an existing activity by ID.
 */
export async function updateActivity(id: string, data: ActivityUpdate): Promise<Activity> {
  const response = await api.put(`/activites/${id}`, data);
  return response.data as Activity;
}

/**
 * Delete an activity by ID.
 */
export async function deleteActivity(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/activites/${id}`);
  return response.data as { message: string };
}

/**
 * Import activities from an Excel file.
 */
export async function importActivities(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/activites/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Download the Excel template for activities.
 */
export async function downloadActivityTemplate() {
  const response = await api.get('/activites/template', {
    responseType: 'blob',
  });
  return response;
}

// =======================
// Activity <-> Beneficiaire API Calls
// =======================

/**
 * Fetch all beneficiaries for a given activity.
 */
export async function getActivityBeneficiaires(activityId: string) {
  const response = await api.get(`/activites/${activityId}/beneficiaires`);
  return response.data;
}

/**
 * Add a beneficiary to an activity.
 */
export async function addBeneficiaireToActivity(activityId: string, beneficiaireId: string) {
  const response = await api.post(`/activites/${activityId}/beneficiaires`, {
    ben_id: beneficiaireId,
  });
  return response.data;
}

/**
 * Remove a beneficiary from an activity.
 */
export async function removeBeneficiaireFromActivity(activityId: string, beneficiaireId: string) {
  const response = await api.delete(`/activites/${activityId}/beneficiaires/${beneficiaireId}`);
  return response.data;
}

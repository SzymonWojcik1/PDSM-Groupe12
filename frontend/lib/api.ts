import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://91.108.184.95:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Bénéficiaires =====

export async function fetchBeneficiaires(search?: string) {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const response = await api.get(`/beneficiaires?${params.toString()}`);
  return response.data;
}

export async function getBeneficiaire(id: string) {
  const response = await api.get(`/beneficiaires/${id}`);
  return response.data;
}

export async function createBeneficiaire(data: any) {
  const response = await api.post('/beneficiaires', data);
  return response.data;
}

export async function updateBeneficiaire(id: string, data: any) {
  const response = await api.put(`/beneficiaires/${id}`, data);
  return response.data;
}

export async function deleteBeneficiaire(id: string) {
  const response = await api.delete(`/beneficiaires/${id}`);
  return response.data;
}

export async function checkBeneficiaireDuplicate(data: any) {
  const response = await api.post('/beneficiaires/check-duplicate', data);
  return response.data;
}

// ===== Enums =====

export async function fetchEnums() {
  const response = await api.get('/enums');
  return response.data;
}

// ===== Activités =====

export async function getAllActivities() {
  const response = await api.get('/activites');
  return response.data;
}

export async function getActivityById(id: string) {
  const response = await api.get(`/activites/${id}`);
  return response.data;
}

export async function createActivity(data: any) {
  const response = await api.post('/activites', data);
  return response.data;
}

export async function updateActivity(id: string, data: any) {
  const response = await api.put(`/activites/${id}`, data);
  return response.data;
}

export async function deleteActivity(id: string) {
  const response = await api.delete(`/activites/${id}`);
  return response.data;
}

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

export async function downloadActivityTemplate() {
  const response = await api.get('/activites/template', {
    responseType: 'blob',
  });
  return response;
}

// ===== Activité <-> Bénéficiaire =====

export async function getActivityBeneficiaires(activityId: string) {
  const response = await api.get(`/activites/${activityId}/beneficiaires`);
  return response.data;
}

export async function addBeneficiaireToActivity(activityId: string, beneficiaireId: string) {
  const response = await api.post(`/activites/${activityId}/beneficiaires`, {
    ben_id: beneficiaireId,
  });
  return response.data;
}

export async function removeBeneficiaireFromActivity(activityId: string, beneficiaireId: string) {
  const response = await api.delete(`/activites/${activityId}/beneficiaires/${beneficiaireId}`);
  return response.data;
}

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchBeneficiaires(search?: string) {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const response = await api.get(`/beneficiaires?${params.toString()}`);
  return response.data;
}

export async function fetchEnums() {
  const response = await api.get('/enums');
  return response.data;
}

export async function getActivityById(id: string) {
  const response = await api.get(`/activites/${id}`);
  return response.data;
}

export async function getActivityBeneficiaires(activityId: string) {
  const response = await api.get(`/activites/${activityId}/beneficiaires`);
  return response.data;
}

export async function addBeneficiaireToActivity(activityId: string, beneficiaireId: string) {
  const response = await api.post(`/activites/${activityId}/beneficiaires`, {
    ben_id: beneficiaireId
  });
  return response.data;
}

export async function removeBeneficiaireFromActivity(activityId: string, beneficiaireId: string) {
  const response = await api.delete(`/activites/${activityId}/beneficiaires/${beneficiaireId}`);
  return response.data;
}

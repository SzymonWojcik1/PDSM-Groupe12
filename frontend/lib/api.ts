export async function fetchBeneficiaires() {
  const res = await fetch('http://127.0.0.1:8000/api/beneficiaires', {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Erreur lors de la récupération des bénéficiaires');
  return res.json();
}

export async function fetchEnums() {
  const res = await fetch('http://localhost:8000/api/enums');
  if (!res.ok) throw new Error('Erreur lors de la récupération des enums');
  return res.json();
}

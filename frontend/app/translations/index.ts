type Translations = {
  [key: string]: {
    fr: string;
    en: string;
    es: string;
  };
};

export const translations: Translations = {
  // Navigation
  dashboard: {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    es: 'Panel de control',
  },
  login: {
    fr: 'Se connecter',
    en: 'Login',
    es: 'Iniciar sesión',
  },
  beneficiaries: {
    fr: 'Bénéficiaires',
    en: 'Beneficiaries',
    es: 'Beneficiarios',
  },
  activities: {
    fr: 'Activités',
    en: 'Activities',
    es: 'Actividades',
  },
  
  // Actions
  create: {
    fr: 'Créer',
    en: 'Create',
    es: 'Crear',
  },
  import: {
    fr: 'Importer',
    en: 'Import',
    es: 'Importar',
  },
  export: {
    fr: 'Exporter',
    en: 'Export',
    es: 'Exportar',
  },
  cancel: {
    fr: 'Annuler',
    en: 'Cancel',
    es: 'Cancelar',
  },
  close: {
    fr: 'Fermer',
    en: 'Close',
    es: 'Cerrar',
  },
  
  // Beneficiaries
  createBeneficiary: {
    fr: 'Créer un bénéficiaire',
    en: 'Create beneficiary',
    es: 'Crear beneficiario',
  },
  searchBeneficiary: {
    fr: 'Rechercher un bénéficiaire...',
    en: 'Search beneficiary...',
    es: 'Buscar beneficiario...',
  },
  importBeneficiaries: {
    fr: 'Importer des bénéficiaires',
    en: 'Import beneficiaries',
    es: 'Importar beneficiarios',
  },
  selectExcelFile: {
    fr: 'Sélectionnez un fichier Excel (.xlsx) contenant la liste des bénéficiaires à importer.',
    en: 'Select an Excel file (.xlsx) containing the list of beneficiaries to import.',
    es: 'Seleccione un archivo Excel (.xlsx) que contenga la lista de beneficiarios para importar.',
  },
  
  // Activities
  createActivity: {
    fr: 'Créer une activité',
    en: 'Create activity',
    es: 'Crear actividad',
  },
  searchActivity: {
    fr: 'Rechercher une activité...',
    en: 'Search activity...',
    es: 'Buscar actividad...',
  },
  importActivities: {
    fr: 'Importer des activités',
    en: 'Import activities',
    es: 'Importar actividades',
  },
  selectFile: {
    fr: 'Sélectionner un fichier',
    en: 'Select a file',
    es: 'Seleccionar un archivo',
  },
  dragAndDrop: {
    fr: 'ou glisser-déposer',
    en: 'or drag and drop',
    es: 'o arrastrar y soltar',
  },
}; 
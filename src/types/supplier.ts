export interface Supplier {
  id: string;
  companyName: string;
  tradeName?: string;
  cnpj: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const supplierCategories = [
  "Veículo de Mídia",
  "Plataforma Digital",
  "Produtora",
  "Gráfica",
  "Tecnologia",
  "Consultoria",
  "Outros",
];

export const createEmptySupplier = (): Supplier => ({
  id: crypto.randomUUID(),
  companyName: "",
  tradeName: "",
  cnpj: "",
  stateRegistration: "",
  municipalRegistration: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  category: "",
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

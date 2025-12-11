export interface RepartitionConfig {
  poidsVente?: number;
  poidsLead?: number;
  tauxConversionGlobal?: number;
  smoothingFactor?: number;
}

export const DEFAULT_REPARTITION_CONFIG: Required<RepartitionConfig> = {
  poidsVente: 0.7,
  poidsLead: 0.3,
  tauxConversionGlobal: 0.001,
  smoothingFactor: 0.3,
};


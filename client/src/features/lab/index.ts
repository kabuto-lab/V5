// Lazy loading for Lab mode to reduce initial bundle size
export const loadLaboratoryModule = async () => {
  const { LaboratoryManager } = await import('./LaboratoryManager');
  return LaboratoryManager;
};

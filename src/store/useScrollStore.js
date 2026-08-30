import { create } from 'zustand';

export const useScrollStore = create((set, get) => ({
  activeSection: 'dashboard', // 'dashboard' | 'pos' | 'inventory' | 'udhaar' | 'analytics'
  scrollProgress: 0,
  scrollY: 0,
  
  // 3D scene camera targets based on active section view
  sectionCameraTargets: {
    'dashboard': { position: [0, 1.2, 5.5], rotation: [0, 0, 0], fov: 45 },
    'pos': { position: [1.8, 0.4, 4.2], rotation: [0.1, -0.25, 0], fov: 42 },
    'inventory': { position: [-1.8, -0.2, 4.5], rotation: [-0.1, 0.25, 0], fov: 45 },
    'udhaar': { position: [0, -0.8, 4.0], rotation: [0.2, 0, 0], fov: 40 },
    'analytics': { position: [0, 0.5, 5.2], rotation: [-0.15, 0, 0], fov: 46 },
    // Backwards compatibility keys
    'pos-section': { position: [1.8, 0.4, 4.2], rotation: [0.1, -0.25, 0], fov: 42 },
    'inventory-section': { position: [-1.8, -0.2, 4.5], rotation: [-0.1, 0.25, 0], fov: 45 },
    'udhaar-section': { position: [0, -0.8, 4.0], rotation: [0.2, 0, 0], fov: 40 },
    'analytics-section': { position: [0, 0.5, 5.2], rotation: [-0.15, 0, 0], fov: 46 },
  },

  setActiveSection: (sectionId) => {
    // Normalize section ID
    const normalized = sectionId.replace('-section', '');
    if (get().activeSection !== normalized) {
      set({ activeSection: normalized });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  setScrollState: (scrollY, maxScroll) => {
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
    const currentProgress = get().scrollProgress;
    if (Math.abs(progress - currentProgress) > 0.005 || Math.abs(scrollY - get().scrollY) > 15) {
      set({ scrollY, scrollProgress: progress });
    }
  },

  scrollToSection: (sectionId) => {
    const normalized = sectionId.replace('-section', '');
    set({ activeSection: normalized });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}));

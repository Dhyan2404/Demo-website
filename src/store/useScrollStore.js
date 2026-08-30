import { create } from 'zustand';

export const useScrollStore = create((set, get) => ({
  activeSection: 'dashboard',
  scrollProgress: 0,
  scrollY: 0,
  
  // 3D scene camera targets based on active section
  sectionCameraTargets: {
    'dashboard': { position: [0, 1.2, 5.5], rotation: [0, 0, 0], fov: 45 },
    'pos-section': { position: [1.8, 0.4, 4.2], rotation: [0.1, -0.25, 0], fov: 42 },
    'inventory-section': { position: [-1.8, -0.2, 4.5], rotation: [-0.1, 0.25, 0], fov: 45 },
    'udhaar-section': { position: [0, -0.8, 4.0], rotation: [0.2, 0, 0], fov: 40 },
    'analytics-section': { position: [0, 0.5, 5.2], rotation: [-0.15, 0, 0], fov: 46 },
  },

  setActiveSection: (sectionId) => {
    if (get().activeSection !== sectionId) {
      set({ activeSection: sectionId });
    }
  },

  setScrollState: (scrollY, maxScroll) => {
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
    set({ scrollY, scrollProgress: progress });
  },

  scrollToSection: (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}));

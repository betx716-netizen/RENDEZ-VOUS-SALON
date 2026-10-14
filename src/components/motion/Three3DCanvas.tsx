import React, { useEffect, useRef, useState } from 'react';

// Illustration de secours élégante si WebGL n'est pas disponible
const FallbackSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative flex items-center justify-center p-8 ${className}`}>
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" className="animate-pulse">
      <circle cx="100" cy="100" r="80" fill="#FFFDF5" stroke="#111111" strokeWidth="3" />
      <circle cx="70" cy="70" r="30" fill="#FF8AD8" fillOpacity="0.2" />
      <circle cx="130" cy="120" r="40" fill="#6A4CF5" fillOpacity="0.2" />
      <circle cx="110" cy="60" r="16" fill="#FFD23F" fillOpacity="0.4" />
    </svg>
  </div>
);

export const Three3DCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Vérification de la compatibilité WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let isDisposed = false;
    let animId = 0;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let isVisible = true;

    // Import dynamique pour préserver le budget initial JS
    import('three').then((THREE) => {
      if (isDisposed || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth || 320;
      const height = container.clientHeight || 320;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 7;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Lumières douces
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
      dirLight.position.set(5, 8, 6);
      scene.add(dirLight);

      const pinkLight = new THREE.PointLight(0xbe185d, 2, 10);
      pinkLight.position.set(-3, 2, 3);
      scene.add(pinkLight);

      // 1. Anneau de ciseau stylisé (Torus) - Rose framboise
      const ringGeo = new THREE.TorusGeometry(1.4, 0.22, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xbe185d,
        roughness: 0.25,
        metalness: 0.4,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(-0.8, 0.4, 0);
      scene.add(ringMesh);

      // 2. Barrette peigne stylisée (Cylinder / Box) - Violet prune
      const barGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 32);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        roughness: 0.3,
        metalness: 0.3,
      });
      const barMesh = new THREE.Mesh(barGeo, barMat);
      barMesh.rotation.z = Math.PI / 4;
      barMesh.position.set(0.6, -0.4, 0.2);
      scene.add(barMesh);

      // 3. Étoile / Éclat or (Octahedron) - Or noble
      const starGeo = new THREE.OctahedronGeometry(0.6, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xd4a24c,
        roughness: 0.2,
        metalness: 0.7,
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.set(1.5, 1.2, 0.5);
      scene.add(starMesh);

      // Suivi fluide du curseur
      let targetX = 0;
      let targetY = 0;
      let mouseX = 0;
      let mouseY = 0;

      const onMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / width - 0.5) * 2;
        targetY = -((e.clientY - rect.top) / height - 0.5) * 2;
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });

      // Mise en pause quand l'élément sort du viewport
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting && document.visibilityState === 'visible';
      });
      observer.observe(container);

      // Mise en pause quand l'onglet est masqué
      const onVisibilityChange = () => {
        isVisible = document.visibilityState === 'visible';
      };
      document.addEventListener('visibilitychange', onVisibilityChange);

      // Redimensionnement
      const onResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', onResize);

      // Boucle de rendu
      let clock = new THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Interpolation douce vers la position de la souris
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        // Animations douces en rotation
        ringMesh.rotation.x = time * 0.4 + mouseY * 0.8;
        ringMesh.rotation.y = time * 0.5 + mouseX * 0.8;

        barMesh.rotation.y = time * 0.3 + mouseX * 0.6;
        barMesh.rotation.x = Math.PI / 4 + mouseY * 0.4;

        starMesh.rotation.x = time * 0.8;
        starMesh.rotation.y = time * 0.9;
        starMesh.position.y = 1.2 + Math.sin(time * 2) * 0.15;

        scene.rotation.y = mouseX * 0.3;
        scene.rotation.x = -mouseY * 0.3;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        observer.disconnect();

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        ringGeo.dispose();
        ringMat.dispose();
        barGeo.dispose();
        barMat.dispose();
        starGeo.dispose();
        starMat.dispose();
      };
    }).catch(() => {
      setHasWebGL(false);
    });

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!hasWebGL) {
    return <FallbackSvg className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[280px] pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};

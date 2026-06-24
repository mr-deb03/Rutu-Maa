'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canvas || reduce) return;

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff2f8, 0.022);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 15);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffd9ec, 1.15); key.position.set(6, 7, 9); scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfa0ff, 0.8); rim.position.set(-7, -4, 4); scene.add(rim);
    const fill = new THREE.PointLight(0xa8e0ff, 0.5, 60); fill.position.set(0, 0, 12); scene.add(fill);

    const palette = [0xff9ec4, 0xff7eb3, 0xc46bff, 0xb8e6ff, 0xd9c7ff, 0xffc2dd, 0xffb38a];
    const blobs = [];
    const isMobile = window.innerWidth < 700;
    const geo = new THREE.IcosahedronGeometry(1, 2);
    for (let i = 0; i < (isMobile ? 7 : 12); i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length], roughness: 0.28 + Math.random() * 0.25, metalness: 0.12,
        transparent: true, opacity: 0.5 + Math.random() * 0.18
      });
      const m = new THREE.Mesh(geo, mat);
      m.scale.setScalar(0.6 + Math.random() * 2.0);
      m.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12 - 3);
      m.userData = { rot: (Math.random() - 0.5) * 0.005, a: Math.random() * Math.PI * 2, speed: 0.15 + Math.random() * 0.4, amp: 0.4 + Math.random() * 0.7, baseY: m.position.y };
      scene.add(m); blobs.push(m);
    }

    const pCount = isMobile ? 120 : 240;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) { pos[i * 3] = (Math.random() - 0.5) * 40; pos[i * 3 + 1] = (Math.random() - 0.5) * 26; pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(points);

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = 0;
    const onMove = (e) => { ptr.tx = e.clientX / window.innerWidth - 0.5; ptr.ty = e.clientY / window.innerHeight - 0.5; };
    const onScroll = () => { scrollY = window.scrollY || 0; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize); resize();

    let running = true, t = 0, raf = 0;
    const onVis = () => { running = !document.hidden; if (running) loop(); };
    document.addEventListener('visibilitychange', onVis);

    function loop() {
      if (!running) return;
      t += 0.016;
      ptr.x += (ptr.tx - ptr.x) * 0.04; ptr.y += (ptr.ty - ptr.y) * 0.04;
      camera.position.x = ptr.x * 3.4; camera.position.y = -ptr.y * 2.4 - scrollY * 0.0012;
      camera.lookAt(0, scrollY * 0.0006, 0);
      for (const m of blobs) { m.rotation.x += m.userData.rot; m.rotation.y += m.userData.rot * 1.25; m.position.y = m.userData.baseY + Math.sin(t * m.userData.speed + m.userData.a) * m.userData.amp; }
      points.rotation.y += 0.0006; points.rotation.x = ptr.y * 0.15;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      geo.dispose(); pGeo.dispose(); renderer.dispose();
    };
  }, []);

  return <canvas id="bg-canvas" ref={ref} aria-hidden="true" />;
}

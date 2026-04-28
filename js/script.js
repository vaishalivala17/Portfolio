const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 6 + 'px';
  cursor.style.top = my - 6 + 'px';
});
function animTrail() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  trail.style.left = tx - 18 + 'px';
  trail.style.top = ty - 18 + 'px';
  requestAnimationFrame(animTrail);
}
animTrail();

document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(2.5)');
  el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
});

// ─── Three.js Background ──────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Particle field
const particleCount = 1800;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 120;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  const isTeal = Math.random() > 0.5;
  colors[i * 3] = isTeal ? 0 : 0.48;
  colors[i * 3 + 1] = isTeal ? 0.9 : 0.35;
  colors[i * 3 + 2] = isTeal ? 1 : 0.93;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const pMat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.55 });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Floating wireframe objects
const objs = [];
const geos = [
  new THREE.IcosahedronGeometry(3, 0),
  new THREE.OctahedronGeometry(2.5, 0),
  new THREE.TetrahedronGeometry(2, 0),
  new THREE.IcosahedronGeometry(2, 0),
  new THREE.OctahedronGeometry(1.8, 0),
];
const wireMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.08 });
geos.forEach((geo, i) => {
  const mesh = new THREE.Mesh(geo, wireMat.clone());
  mesh.position.set(
    (Math.random() - 0.5) * 50,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 20 - 10
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  objs.push({ mesh, speed: 0.003 + Math.random() * 0.004, floatY: Math.random() * Math.PI * 2 });
  scene.add(mesh);
});

// Grid plane
const gridHelper = new THREE.GridHelper(100, 30, 0x00e5ff, 0x0d2030);
gridHelper.position.y = -20;
gridHelper.material.opacity = 0.15;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Mouse parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  particles.rotation.y = time * 0.03;
  particles.rotation.x = time * 0.01;

  objs.forEach(({ mesh, speed, floatY }, i) => {
    mesh.rotation.x += speed;
    mesh.rotation.y += speed * 0.7;
    mesh.position.y += Math.sin(time + floatY) * 0.01;
  });

  camera.position.x += (mouseX * 4 - camera.position.x) * 0.04;
  camera.position.y += (-mouseY * 3 - camera.position.y) * 0.04;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Typing Effect ────────────────────────────────────────
const phrases = ['Full Stack Developer', 'MERN Stack Enthusiast', 'Clean Code Advocate', 'Problem Solver'];
let pi = 0, ci = 0, deleting = false;
const typingEl = document.getElementById('typing-text');
function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    typingEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
  } else {
    typingEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 60 : 100);
}
type();

// ─── Scroll reveal ────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i * 0.08) + 's';
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── 3D Card Tilt ─────────────────────────────────────────
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── Smooth scroll ────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});
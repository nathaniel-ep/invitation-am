  // Isolation d'erreur : chaque section s'initialise indépendamment.
  // Si l'une échoue (ex. un id HTML renommé), les autres continuent de fonctionner.
  function safeInit(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error(`Échec de l'initialisation « ${name} » :`, err);
    }
  }

  safeInit("écran code d'accès", () => {
  // ============ ÉCRAN CODE D'ACCÈS (en premier pour fiabilité) ============
  (function setupAccessScreen() {
    const ACCESS_CODE = 'DEMO2026';
    const accessScreen = document.getElementById('accessScreen');
    const accessForm = document.getElementById('accessForm');
    const accessInput = document.getElementById('accessInput');
    const accessError = document.getElementById('accessError');

    if (!accessScreen || !accessForm || !accessInput) {
      console.warn('Access screen elements missing');
      return;
    }

    // L'écran s'affiche TOUJOURS au chargement (pas de mémoire de session)
    // Cela évite tout bug lié au sessionStorage
    accessScreen.style.display = 'flex';
    
    setTimeout(() => { try { accessInput.focus(); } catch(e){} }, 1500);

    function validateAccess(e) {
      if (e) e.preventDefault();
      const code = (accessInput.value || '').trim().toUpperCase();
      
      if (code === ACCESS_CODE) {
        accessScreen.classList.add('hidden');
        setTimeout(() => {
          accessScreen.style.display = 'none';
        }, 1500);
      } else {
        accessInput.classList.add('error');
        if (accessError) accessError.classList.add('visible');
        accessInput.value = '';
        setTimeout(() => {
          accessInput.classList.remove('error');
          try { accessInput.focus(); } catch(e){}
        }, 500);
      }
      return false;
    }

    // Multiple event handlers pour fiabilité maximale
    accessForm.addEventListener('submit', validateAccess);
    
    // Le bouton submit
    const submitBtn = accessForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', validateAccess);
    }
    
    // Touche Enter dans l'input
    accessInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') validateAccess(e);
    });
  })();
  });

  safeInit('curseur colombe', () => {
  // ============ CURSEUR COLOMBE + FEUILLES ============
  // Actif uniquement sur les appareils avec souris (le CSS masque la colombe sur tactile)
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursorDove = document.getElementById('cursorDove');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let doveX = mouseX, doveY = mouseY;
  let lastLeafTime = 0;

  // Couleurs de feuilles pour la traîne
  const leafColors = ['#5a6e3f', '#7a9258', '#8ba56a', '#3d4f2e'];

  function createLeaf(x, y) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf-trail';
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const size = 8 + Math.random() * 8;
    const rotation = Math.random() * 360;
    
    leaf.innerHTML = `
      <svg viewBox="0 0 20 20" width="${size}" height="${size}" style="transform: rotate(${rotation}deg);">
        <ellipse cx="10" cy="10" rx="9" ry="3" fill="${color}"/>
        <path d="M2 10 Q10 8 18 10" stroke="${color}" stroke-width="0.4" fill="none" opacity="0.6"/>
      </svg>
    `;
    
    leaf.style.left = x + 'px';
    leaf.style.top = y + 'px';
    document.body.appendChild(leaf);
    
    // Animation : descend, tourne, disparaît
    const driftX = (Math.random() - 0.5) * 60;
    const driftY = 40 + Math.random() * 60;
    const finalRotation = rotation + (Math.random() - 0.5) * 360;
    
    leaf.animate([
      { 
        transform: 'translate(-50%, -50%) translate(0, 0) rotate(0deg)', 
        opacity: 0.9 
      },
      { 
        transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) rotate(${finalRotation}deg)`, 
        opacity: 0 
      }
    ], {
      duration: 1500 + Math.random() * 800,
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      fill: 'forwards'
    });
    
    setTimeout(() => leaf.remove(), 2300);
  }

  // Animation fluide de la colombe (suit avec lerp)
  function animateCursor() {
    doveX += (mouseX - doveX) * 0.18;
    doveY += (mouseY - doveY) * 0.18;
    cursorDove.style.left = doveX + 'px';
    cursorDove.style.top = doveY + 'px';
    requestAnimationFrame(animateCursor);
  }

  if (hasMouse) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Créer une feuille toutes les 50ms minimum
      const now = Date.now();
      if (now - lastLeafTime > 50) {
        createLeaf(mouseX, mouseY);
        lastLeafTime = now;
      }
    });

    animateCursor();

    // Cacher la colombe quand on quitte la fenêtre
    document.addEventListener('mouseleave', () => cursorDove.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursorDove.style.opacity = '1');
  }

  });

  safeInit("enveloppe d'ouverture", () => {
  // ============ ENVELOPPE - TRANSITION ZOOM IMMERSIF ============
  const envelope = document.getElementById('envelope');
  const envelopeScreen = document.getElementById('envelopeScreen');
  const site = document.getElementById('site');

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('opening')) return;
    envelope.classList.add('opening');
    
    // Étape 1 : Enveloppe s'ouvre, sceau saute, lettre sort (1.6s)
    setTimeout(() => {
      // Étape 2 : Zoom immersif - l'écran enveloppe zoome et fade
      envelopeScreen.classList.add('zooming');
      
      setTimeout(() => {
        // Étape 3 : Cacher complètement l'écran et révéler le site
        envelopeScreen.classList.add('hidden');
        site.classList.add('revealed');
        // Retirer le verrou de scroll (retour à la valeur CSS : seul html scrolle)
        document.body.style.overflow = '';
        
        // Déclencher le reveal séquentiel des lignes du hero
        revealHeroSequentially();
      }, 1500);
    }, 1600);
  });

  document.body.style.overflow = 'hidden';

  // Partager l'image de fond oliveraie entre hero et save-the-date
  (function shareHeroBg() {
    const heroBg = document.querySelector('.hero-bg');
    const stdBg = document.querySelector('.std-bg');
    if (heroBg && stdBg) {
      const computed = getComputedStyle(heroBg).backgroundImage;
      stdBg.style.backgroundImage = computed;
    }
  })();
  });

  // ============ FEUILLES D'OLIVIER FLOTTANTES (réalistes) ============
  // SVG de feuille d'olivier dessinée avec dégradés pour effet réaliste
  function createOliveLeaf(variant) {
    const variants = [
      // Vert clair (jeune feuille, dessus)
      { c1: '#a8c08a', c2: '#7a9258', c3: '#5a7340', stroke: '#3d4f2e' },
      // Vert moyen (mature)
      { c1: '#8ba56a', c2: '#5a6e3f', c3: '#3d4f2e', stroke: '#2a3622' },
      // Vert argenté (dessous de feuille typique des oliviers)
      { c1: '#d4dcb8', c2: '#a8b88a', c3: '#7a9258', stroke: '#5a6e3f' },
      // Vert sombre
      { c1: '#7a9258', c2: '#3d4f2e', c3: '#2a3622', stroke: '#1a2114' },
    ];
    const v = variants[variant % variants.length];
    const id = 'lg' + Math.random().toString(36).substr(2, 6);
    return `
      <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${v.c1}"/>
            <stop offset="50%" stop-color="${v.c2}"/>
            <stop offset="100%" stop-color="${v.c3}"/>
          </linearGradient>
          <linearGradient id="${id}h" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
            <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <!-- Forme de feuille (lancéolée, typique de l'olivier) -->
        <path d="M2 10 Q15 4 30 6 Q45 8 58 10 Q45 12 30 14 Q15 16 2 10 Z" 
              fill="url(#${id})" stroke="${v.stroke}" stroke-width="0.3"/>
        <!-- Nervure centrale -->
        <path d="M3 10 Q30 10 57 10" stroke="${v.stroke}" stroke-width="0.4" fill="none" opacity="0.5"/>
        <!-- Nervures secondaires -->
        <path d="M15 9 Q18 11 22 12" stroke="${v.stroke}" stroke-width="0.2" fill="none" opacity="0.4"/>
        <path d="M30 8 Q33 10 38 11" stroke="${v.stroke}" stroke-width="0.2" fill="none" opacity="0.4"/>
        <path d="M40 9 Q43 11 48 12" stroke="${v.stroke}" stroke-width="0.2" fill="none" opacity="0.4"/>
        <!-- Reflet lumineux sur le dessus -->
        <path d="M5 9 Q20 6 30 7 Q40 8 55 10" 
              fill="none" stroke="url(#${id}h)" stroke-width="0.8" opacity="0.6"/>
      </svg>
    `;
  }

  // ============ HERO REVEAL SÉQUENTIEL ============
  // Apparition une par une des lignes du hero, déclenchée à l'arrivée sur le site
  function revealHeroSequentially() {
    const lines = document.querySelectorAll('.hero-line');
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.classList.add('visible');
      }, 600 + index * 700); // 700ms entre chaque ligne
    });
  }
  // Sera appelée après l'ouverture de l'enveloppe (voir plus bas)

  safeInit('feuilles flottantes', () => {
  function spawnFloatingLeaf() {
    const container = document.getElementById('floatingLeaves');
    if (!container) return;
    
    const leaf = document.createElement('div');
    leaf.className = 'floating-leaf';
    
    // Taille aléatoire (petites = au loin, grandes = au premier plan)
    const size = 25 + Math.random() * 50; // 25 à 75px
    const startX = Math.random() * 100; // 0% à 100%
    const startY = -10 + Math.random() * 30; // commence en haut/sortie d'écran
    const duration = 12 + Math.random() * 10; // 12s à 22s
    const horizontalDrift = (Math.random() - 0.5) * 200; // dérive latérale
    const rotationStart = Math.random() * 360;
    const rotationEnd = rotationStart + (Math.random() - 0.5) * 720; // tourne en tombant
    const variant = Math.floor(Math.random() * 4);
    
    leaf.style.cssText = `
      width: ${size}px;
      height: ${size * 0.33}px;
      left: ${startX}%;
      top: ${startY}%;
      opacity: ${0.7 + Math.random() * 0.3};
    `;
    
    leaf.innerHTML = createOliveLeaf(variant);
    container.appendChild(leaf);
    
    // Animation de chute avec balancement
    const animation = leaf.animate([
      {
        transform: `translate(0, 0) rotate(${rotationStart}deg)`,
        offset: 0,
      },
      {
        transform: `translate(${horizontalDrift * 0.3}px, 30vh) rotate(${rotationStart + (rotationEnd - rotationStart) * 0.3}deg)`,
        offset: 0.3,
      },
      {
        transform: `translate(${horizontalDrift * 0.7}px, 60vh) rotate(${rotationStart + (rotationEnd - rotationStart) * 0.7}deg)`,
        offset: 0.7,
      },
      {
        transform: `translate(${horizontalDrift}px, 110vh) rotate(${rotationEnd}deg)`,
        offset: 1,
      }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.4, 0.05, 0.4, 1)',
      fill: 'forwards'
    });
    
    animation.onfinish = () => leaf.remove();
  }

  // Lancer des feuilles à intervalles réguliers
  let leafSpawnInterval;
  function startLeafSpawn() {
    // Plusieurs feuilles initiales (pour que l'écran soit déjà rempli au lancement)
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnFloatingLeaf, i * 800);
    }
    // Puis une feuille toutes les 1.5-3s
    leafSpawnInterval = setInterval(() => {
      spawnFloatingLeaf();
    }, 1500 + Math.random() * 1500);
  }

  // Démarrer dès que le site est révélé
  setTimeout(startLeafSpawn, 500);
  });

  safeInit('parallaxe du fond', () => {
  // ============ PARALLAXE LÉGÈRE SUR L'IMAGE DE FOND ============
  const heroBg = document.querySelector('.hero-bg');
  let parallaxX = 0, parallaxY = 0;
  let breathT = 0;
  let isMouseActive = false;
  let mouseTimeout;
  
  window.addEventListener('mousemove', (e) => {
    parallaxX = (e.clientX / window.innerWidth - 0.5) * 2;
    parallaxY = (e.clientY / window.innerHeight - 0.5) * 2;
    isMouseActive = true;
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(() => { isMouseActive = false; }, 2000);
  });

  // Animation continue : respiration douce + parallaxe combinées via JS
  function animateHeroBg() {
    if (heroBg) {
      breathT += 0.003;
      const breathScale = 1.06 + Math.sin(breathT) * 0.02; // 1.04 à 1.08
      const breathY = Math.sin(breathT) * 8;
      const tx = parallaxX * 12;
      const ty = parallaxY * 6 + breathY;
      heroBg.style.transform = `scale(${breathScale}) translate(${tx}px, ${ty}px)`;
    }
    requestAnimationFrame(animateHeroBg);
  }
  animateHeroBg();
  });

  safeInit('particules', () => {
  // ============ PARTICULES (POLLEN LUMINEUX) ============
  const particlesContainer = document.getElementById('particles');
  
  function createParticle() {
    if (!particlesContainer) return;
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.animationDelay = Math.random() * 3 + 's';
    const size = 2 + Math.random() * 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particlesContainer.appendChild(particle);
    setTimeout(() => particle.remove(), 20000);
  }
  
  // Créer des particules régulièrement
  setInterval(createParticle, 600);
  // Démarrage : créer plusieurs d'un coup
  for (let i = 0; i < 8; i++) setTimeout(createParticle, i * 300);
  });

  safeInit('compte à rebours', () => {
  // ============ COMPTE À REBOURS ============
  const weddingDate = new Date('2026-09-12T11:00:00+02:00').getTime();

  function updateCountdown() {
    const now = Date.now();
    const distance = weddingDate - now;

    if (distance < 0) {
      ['days','hours','minutes','seconds'].forEach(id => {
        document.getElementById(id).textContent = '00';
      });
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  const countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
  });

  safeInit('animations au scroll', () => {
  // ============ REVEAL ON SCROLL ============
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Observer dédié pour les cartes programme (effet flou → net)
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.programme-card').forEach(el => cardObserver.observe(el));

  // Observer pour les pastilles de couleur (animation peinture qui se remplit)
  const swatchObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        swatchObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.color-swatch').forEach(el => swatchObserver.observe(el));

  // Observer pour les paragraphes story (apparition individuelle)
  const storyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        storyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.story-para, .story-medallion, .story-verse').forEach(el => storyObserver.observe(el));

  // Quand on entre dans la story, lancer une pluie de feuilles dans cette section
  const storySection = document.querySelector('.story-section');
  const storyLeavesContainer = document.getElementById('storyLeaves');
  let storyLeavesActive = false;

  function spawnStoryLeaf() {
    if (!storyLeavesContainer || !storyLeavesActive) return;
    
    const leaf = document.createElement('div');
    leaf.className = 'floating-leaf';
    
    const size = 20 + Math.random() * 30;
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 6;
    const horizontalDrift = (Math.random() - 0.5) * 100;
    const rotationStart = Math.random() * 360;
    const rotationEnd = rotationStart + (Math.random() - 0.5) * 540;
    const variant = Math.floor(Math.random() * 4);
    
    leaf.style.cssText = `
      width: ${size}px;
      height: ${size * 0.33}px;
      left: ${startX}%;
      top: -10%;
      opacity: ${0.5 + Math.random() * 0.3};
      position: absolute;
      pointer-events: none;
    `;
    
    leaf.innerHTML = createOliveLeaf(variant);
    storyLeavesContainer.appendChild(leaf);
    
    leaf.animate([
      { transform: `translate(0, 0) rotate(${rotationStart}deg)` },
      { transform: `translate(${horizontalDrift}px, 110vh) rotate(${rotationEnd}deg)` }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.4, 0.05, 0.4, 1)',
      fill: 'forwards'
    }).onfinish = () => leaf.remove();
  }

  if (storySection) {
    const storyLeavesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        storyLeavesActive = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    storyLeavesObserver.observe(storySection);
    
    // Spawn une feuille toutes les 800ms quand actif
    setInterval(() => {
      if (storyLeavesActive) spawnStoryLeaf();
    }, 800);
  }
  });

  safeInit('formulaire RSVP', () => {
  // ============ FORMULAIRE RSVP ============
  // URL du Web App Google Apps Script (voir SETUP-GOOGLE-SHEETS.md).
  // Tant qu'elle est vide, tout envoi affiche l'erreur : aucune réponse ne peut se perdre en silence.
  const SHEETS_ENDPOINT = '';

  const form = document.getElementById('rsvpForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const guestsGroup = document.getElementById('guestsGroup');
  const dietGroup = document.getElementById('dietGroup');
  const guestNamesGroup = document.getElementById('guestNamesGroup');
  const guestNamesList = document.getElementById('guestNamesList');
  const guestsSelect = document.getElementById('guests');

  // Générer les champs noms en fonction du nombre de personnes
  function updateGuestNames() {
    const count = parseInt(guestsSelect.value);
    guestNamesList.innerHTML = '';
    
    if (count > 1) {
      guestNamesGroup.style.display = 'block';
      // Animation slide-down
      guestNamesGroup.style.opacity = '0';
      guestNamesGroup.style.maxHeight = '0';
      
      for (let i = 1; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'guest-name-input';
        wrapper.style.cssText = 'margin-bottom: 0.75rem; opacity: 0; transform: translateY(-10px); transition: opacity 0.4s ease, transform 0.4s ease;';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `guest_${i}`;
        input.className = 'form-input';
        input.placeholder = `Accompagnant ${i} — nom et prénom`;
        input.required = true;
        
        wrapper.appendChild(input);
        guestNamesList.appendChild(wrapper);
        
        setTimeout(() => {
          wrapper.style.opacity = '1';
          wrapper.style.transform = 'translateY(0)';
        }, 50 + i * 80);
      }
      
      setTimeout(() => {
        guestNamesGroup.style.opacity = '1';
        guestNamesGroup.style.maxHeight = '500px';
      }, 30);
    } else {
      guestNamesGroup.style.display = 'none';
    }
  }

  guestsSelect.addEventListener('change', updateGuestNames);

  document.querySelectorAll('input[name="attendance"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'non') {
        guestsGroup.style.display = 'none';
        dietGroup.style.display = 'none';
        guestNamesGroup.style.display = 'none';
      } else {
        guestsGroup.style.display = 'block';
        dietGroup.style.display = 'block';
        updateGuestNames();
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';
    formError.style.display = 'none';

    const formData = new FormData(form);
    
    // Récupérer les noms des accompagnants
    const guestCount = parseInt(formData.get('guests') || '1');
    const guestNames = [];
    for (let i = 1; i < guestCount; i++) {
      const name = formData.get(`guest_${i}`);
      if (name) guestNames.push(name);
    }
    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      attendance: formData.get('attendance'),
      guests: formData.get('guests') || '—',
      guestNames: guestNames.join(', ') || 'Aucun',
      diet: formData.get('diet') || 'Aucun',
      message: formData.get('message') || 'Aucun message',
      timestamp: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
    };

    const isAttending = data.attendance === 'oui';

    // Envoi en parallèle vers Google Sheets ET formsubmit (email).
    // La réponse n'est validée que si LES DEUX confirment l'enregistrement.
    const sheetPromise = (async () => {
      if (!SHEETS_ENDPOINT) throw new Error('SHEETS_ENDPOINT non configuré');
      const resp = await fetch(SHEETS_ENDPOINT, {
        method: 'POST',
        // text/plain = requête CORS "simple", sans préflight (non géré par Apps Script)
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error('Sheets HTTP ' + resp.status);
      const result = await resp.json();
      if (!result.ok) throw new Error('Sheets : ' + (result.error || 'réponse inattendue'));
    })();

    const emailPromise = (async () => {
      const resp = await fetch('https://formsubmit.co/ajax/contact@exemple-mariage.fr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `RSVP Mariage E&L — ${data.name} — ${isAttending ? 'PRÉSENT' : 'ABSENT'}`,
          _captcha: 'false',
          Nom: data.name,
          Email: data.email,
          Présence: isAttending ? 'OUI, avec joie' : 'NON, avec regret',
          'Nombre de personnes': data.guests,
          'Noms accompagnants': data.guestNames,
          'Régime alimentaire': data.diet,
          Message: data.message,
          'Date envoi': data.timestamp
        })
      });
      if (!resp.ok) throw new Error('formsubmit HTTP ' + resp.status);
      const result = await resp.json();
      if (String(result.success) !== 'true') throw new Error('formsubmit : ' + (result.message || 'refus'));
    })();

    const results = await Promise.allSettled([sheetPromise, emailPromise]);
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      failures.forEach(f => console.error('RSVP send failed:', f.reason));

      // Plan C : lien mailto pré-rempli avec la réponse saisie
      const subject = encodeURIComponent(`RSVP Mariage E&L — ${data.name} — ${isAttending ? 'PRÉSENT' : 'ABSENT'}`);
      const body = encodeURIComponent(
        `Nom: ${data.name}\nEmail: ${data.email}\nPrésence: ${isAttending ? 'OUI' : 'NON'}\n` +
        (isAttending ? `Personnes: ${data.guests}\nAccompagnants: ${data.guestNames}\nRégime: ${data.diet}\n` : '') +
        `Message: ${data.message}\nDate: ${data.timestamp}`
      );
      const mailtoFallback = document.getElementById('mailtoFallback');
      if (mailtoFallback) mailtoFallback.href = `mailto:contact@exemple-mariage.fr?subject=${subject}&body=${body}`;

      formError.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer ma réponse';
      return;
    }

    form.style.display = 'none';
    formSuccess.classList.add('active');

    if (!isAttending) {
      successMessage.textContent = 'Merci d\'avoir pris le temps de nous répondre. Nous comprenons et vous portons dans nos pensées.';
      document.querySelector('.calendar-buttons').style.display = 'none';
    }

    // Calendrier
    const startDate = '20260912T110000';
    const endDate = '20260913T020000';
    const eventTitle = encodeURIComponent('Mariage Emma & Lucas');
    const eventDetails = encodeURIComponent('Cérémonie civile à 11h, religieuse à 15h, réception à 19h. Code vestimentaire : vert sauge & marron chocolat.');
    const eventLocation = encodeURIComponent('15 Chemin des Lavandes, 83920 La Motte, France');

    document.getElementById('googleCal').href =
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDetails}&location=${eventLocation}&ctz=Europe/Paris`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Emma et Lucas//Mariage//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      // Définition du fuseau Europe/Paris (avec heure d'été) —
      // requis par la RFC 5545 pour que Outlook interprète les TZID correctement
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Paris',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:mariage-emma-lucas-2026@exemple-mariage.fr',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART;TZID=Europe/Paris:20260912T110000',
      'DTEND;TZID=Europe/Paris:20260913T020000',
      'SUMMARY:Mariage Emma & Lucas',
      'DESCRIPTION:Ceremonie civile a 11h\\, religieuse a 15h\\, reception a 19h.',
      'LOCATION:15 Chemin des Lavandes\\, 83920 La Motte\\, France',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Mariage E&L dans une semaine',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(blob);
    const appleLink = document.getElementById('appleCal');
    appleLink.href = icsUrl;
    appleLink.download = 'mariage-emma-lucas.ics';
  });

  });

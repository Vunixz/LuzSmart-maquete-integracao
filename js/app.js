/**
 * Main Application Orchestrator - Plataforma & Central de Simuladores ESP32
 * Suporta:
 * 1. Simulador da Cidade 3D (Avenida Urbana com Postes, Carros e Pedestres)
 * 2. Simulador da Maquete Física (Bancada Maker com ESP32 na Protoboard, Postes de Palito com LEDs e Mão 3D)
 * 3. Central de Simuladores (Launchpad & App Switcher)
 * 4. Gerenciador macOS com Janelas Arrastáveis e Recolhíveis
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Controlador ESP32, as 2 Cenas 3D e o Gerenciador macOS
  const controller = new ESP32LightingController();
  const streetScene = new SmartStreetScene('webgl-container', controller);
  const maqueteScene = new MaquetePhysicalScene('webgl-maquete-container', controller);
  const windowManager = new MacOSWindowManager();
  const energyDashboard = new EnergyDashboard(controller);

  let currentApp = 'city'; // 'city' | 'maquete'

  // 2. Sistema de Troca de Simuladores (Plataforma Hub)
  function switchApp(appId) {
    if (appId === currentApp) return;
    currentApp = appId;

    const cityCanvas = document.getElementById('webgl-container');
    const maqueteCanvas = document.getElementById('webgl-maquete-container');
    const tagsContainer = document.getElementById('pole-3d-tags-container');

    const btnSwitchCity = document.getElementById('btn-switch-city');
    const btnSwitchMaquete = document.getElementById('btn-switch-maquete');
    const dockBtnCity = document.getElementById('dock-btn-switch-city');
    const dockBtnMaquete = document.getElementById('dock-btn-switch-maquete');

    const cardLaunchCity = document.getElementById('card-launch-city');
    const cardLaunchMaquete = document.getElementById('card-launch-maquete');

    const trafficCity = document.getElementById('traffic-section-city');
    const trafficMaquete = document.getElementById('traffic-section-maquete');
    const trafficTitle = document.getElementById('traffic-window-title');

    const cameraCity = document.getElementById('camera-section-city');
    const cameraMaquete = document.getElementById('camera-section-maquete');

    if (appId === 'city') {
      cityCanvas.style.display = 'block';
      maqueteCanvas.style.display = 'none';
      if (tagsContainer) tagsContainer.style.display = 'block';

      if (btnSwitchCity) btnSwitchCity.classList.add('active');
      if (btnSwitchMaquete) btnSwitchMaquete.classList.remove('active');
      if (dockBtnCity) dockBtnCity.classList.add('active');
      if (dockBtnMaquete) dockBtnMaquete.classList.remove('active');

      if (cardLaunchCity) cardLaunchCity.classList.add('active');
      if (cardLaunchMaquete) cardLaunchMaquete.classList.remove('active');

      if (trafficCity) trafficCity.style.display = 'block';
      if (trafficMaquete) trafficMaquete.style.display = 'none';
      if (trafficTitle) trafficTitle.innerText = 'Tráfego & Atores';

      if (cameraCity) cameraCity.style.display = 'flex';
      if (cameraMaquete) cameraMaquete.style.display = 'none';

      streetScene.onWindowResize();
    } else {
      cityCanvas.style.display = 'none';
      maqueteCanvas.style.display = 'block';
      if (tagsContainer) tagsContainer.style.display = 'none';

      if (btnSwitchCity) btnSwitchCity.classList.remove('active');
      if (btnSwitchMaquete) btnSwitchMaquete.classList.add('active');
      if (dockBtnCity) dockBtnCity.classList.remove('active');
      if (dockBtnMaquete) dockBtnMaquete.classList.add('active');

      if (cardLaunchCity) cardLaunchCity.classList.remove('active');
      if (cardLaunchMaquete) cardLaunchMaquete.classList.add('active');

      if (trafficCity) trafficCity.style.display = 'none';
      if (trafficMaquete) trafficMaquete.style.display = 'block';
      if (trafficTitle) trafficTitle.innerText = 'Mão 3D & Sensores';

      if (cameraCity) cameraCity.style.display = 'none';
      if (cameraMaquete) cameraMaquete.style.display = 'flex';

      maqueteScene.onWindowResize();
    }
  }

  // Eventos dos botões de alternância da barra superior e do Dock
  const btnSwitchCity = document.getElementById('btn-switch-city');
  const btnSwitchMaquete = document.getElementById('btn-switch-maquete');
  const dockBtnCity = document.getElementById('dock-btn-switch-city');
  const dockBtnMaquete = document.getElementById('dock-btn-switch-maquete');

  if (btnSwitchCity) btnSwitchCity.addEventListener('click', () => switchApp('city'));
  if (btnSwitchMaquete) btnSwitchMaquete.addEventListener('click', () => switchApp('maquete'));
  if (dockBtnCity) dockBtnCity.addEventListener('click', () => switchApp('city'));
  if (dockBtnMaquete) dockBtnMaquete.addEventListener('click', () => switchApp('maquete'));

  // 3. Central de Apps / Launchpad Modal
  const modalLaunchpad = document.getElementById('modal-launchpad');
  const btnHubMenu = document.getElementById('btn-hub-menu');
  const dockBtnLaunchpad = document.getElementById('dock-btn-launchpad');
  const cardLaunchCity = document.getElementById('card-launch-city');
  const cardLaunchMaquete = document.getElementById('card-launch-maquete');

  function toggleLaunchpad() {
    if (modalLaunchpad) {
      modalLaunchpad.classList.toggle('open');
    }
  }

  if (btnHubMenu) btnHubMenu.addEventListener('click', toggleLaunchpad);
  if (dockBtnLaunchpad) dockBtnLaunchpad.addEventListener('click', toggleLaunchpad);

  if (cardLaunchCity) {
    cardLaunchCity.addEventListener('click', () => {
      switchApp('city');
      modalLaunchpad.classList.remove('open');
    });
  }

  if (cardLaunchMaquete) {
    cardLaunchMaquete.addEventListener('click', () => {
      switchApp('maquete');
      modalLaunchpad.classList.remove('open');
    });
  }

  if (modalLaunchpad) {
    modalLaunchpad.addEventListener('click', (e) => {
      if (e.target === modalLaunchpad) modalLaunchpad.classList.remove('open');
    });
  }

  // 4. Elementos da Interface (HUD e Menubar)
  const ldrSlider = document.getElementById('ldr-slider');
  const ldrValueText = document.getElementById('ldr-value-text');
  const ldrLuxText = document.getElementById('ldr-lux-text');
  const statusEnvPill = document.getElementById('status-env-pill');
  const statusEnvText = document.getElementById('status-env-text');
  const statusSavedPercent = document.getElementById('status-saved-percent');
  const virtualClockText = document.getElementById('virtual-clock');
  const pedCountBadge = document.getElementById('pedestrian-count-badge');

  // Modo Rua / Encolher ou Expandir Todas as Janelas
  let allCollapsed = false;
  const btnToggleImmersive = document.getElementById('btn-toggle-immersive');
  const dockBtnImmersive = document.getElementById('dock-btn-immersive');

  function toggleCollapseAll() {
    allCollapsed = !allCollapsed;
    if (allCollapsed) {
      windowManager.collapseAllWindows();
      if (btnToggleImmersive) {
        btnToggleImmersive.innerHTML = '<i class="fa-solid fa-eye"></i> <span>Expandir</span>';
      }
    } else {
      windowManager.expandAllWindows();
      if (btnToggleImmersive) {
        btnToggleImmersive.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <span>Modo Rua</span>';
      }
    }
  }

  if (btnToggleImmersive) btnToggleImmersive.addEventListener('click', toggleCollapseAll);
  if (dockBtnImmersive) dockBtnImmersive.addEventListener('click', toggleCollapseAll);

  // Tecla de atalho 'H' para recolher janelas e 'ESC' para launchpad
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
      if (document.activeElement.tagName !== 'INPUT') {
        toggleCollapseAll();
      }
    } else if (e.key === 'Escape') {
      if (modalLaunchpad && modalLaunchpad.classList.contains('open')) {
        modalLaunchpad.classList.remove('open');
      }
    }
  });

  // Menubar Superior
  const menuCollapseAll = document.getElementById('menu-collapse-all');
  if (menuCollapseAll) menuCollapseAll.addEventListener('click', toggleCollapseAll);

  const menuShowAll = document.getElementById('menu-show-all');
  if (menuShowAll) {
    menuShowAll.addEventListener('click', () => {
      windowManager.showAllWindows();
      windowManager.expandAllWindows();
      allCollapsed = false;
      if (btnToggleImmersive) {
        btnToggleImmersive.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <span>Modo Rua</span>';
      }
    });
  }

  // 5. macOS Dock (Alternar Janelas Flutuantes)
  document.querySelectorAll('.dock-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      windowManager.toggleWindow(targetId);
    });
  });

  // 6. PIR Cards (Sensores 1 a 6)
  const pirCards = [];
  const pirTimers = [];
  for (let i = 0; i < 6; i++) {
    const card = document.getElementById(`pir-card-${i + 1}`);
    const timerFill = document.getElementById(`pir-timer-fill-${i + 1}`);
    const timeText = document.getElementById(`pir-time-text-${i + 1}`);
    pirCards.push(card);
    pirTimers.push({ fill: timerFill, text: timeText });

    if (card) {
      card.addEventListener('click', () => {
        if (currentApp === 'maquete') {
          maqueteScene.clickButtonWithHand(i);
        } else {
          controller.triggerManualPIR(i, true);
        }
      });
    }
  }

  // 7. Medidores dos Postes Inteligentes
  const poleProgressFills = [];
  const poleValTexts = [];
  const poleRows = [];
  for (let i = 0; i < 6; i++) {
    poleProgressFills.push(document.getElementById(`pole-fill-${i + 1}`));
    poleValTexts.push(document.getElementById(`pole-val-${i + 1}`));
    poleRows.push(document.getElementById(`pole-row-${i + 1}`));
  }

  // 8. Controles do LDR & Presets Dia / Crepúsculo / Noite
  if (ldrSlider) {
    ldrSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      controller.setLdrValue(val);
      if (currentApp === 'maquete') {
        // Mão 3D acompanha e gira a roda em TEMPO REAL ao mover a barra de ADC
        maqueteScene.trackHandToAdcSlider(val);
        maqueteScene.scheduleReleaseHandAfterAdc(650);
      }
    });

    ldrSlider.addEventListener('change', (e) => {
      const val = Number(e.target.value);
      controller.setLdrValue(val);
      if (currentApp === 'maquete') {
        maqueteScene.trackHandToAdcSlider(val);
        maqueteScene.scheduleReleaseHandAfterAdc(220);
      }
    });
  }

  // Listener para sincronizar a UI quando a mão 3D gira a roda de luz na maquete
  window.addEventListener('maqueteLdrTurned', (e) => {
    const val = Math.round(e.detail.value);
    if (ldrSlider) ldrSlider.value = val;
    if (ldrValueText) ldrValueText.innerText = `${val} ADC`;
    if (val >= 2500) {
      updateCycleButtons(btnDay);
    } else if (val >= 1200) {
      updateCycleButtons(btnDusk);
    } else {
      updateCycleButtons(btnNight);
    }
  });

  const btnDay = document.getElementById('btn-preset-day');
  const btnDusk = document.getElementById('btn-preset-dusk');
  const btnNight = document.getElementById('btn-preset-night');

  if (btnDay) {
    btnDay.addEventListener('click', () => {
      if (currentApp === 'maquete') {
        maqueteScene.adjustLightWheelWithHand(3600);
      } else {
        if (ldrSlider) ldrSlider.value = 3600;
        controller.setLdrValue(3600);
      }
      updateCycleButtons(btnDay);
    });
  }

  if (btnDusk) {
    btnDusk.addEventListener('click', () => {
      if (currentApp === 'maquete') {
        maqueteScene.adjustLightWheelWithHand(1750);
      } else {
        if (ldrSlider) ldrSlider.value = 1750;
        controller.setLdrValue(1750);
      }
      updateCycleButtons(btnDusk);
    });
  }

  if (btnNight) {
    btnNight.addEventListener('click', () => {
      if (currentApp === 'maquete') {
        maqueteScene.adjustLightWheelWithHand(450);
      } else {
        if (ldrSlider) ldrSlider.value = 450;
        controller.setLdrValue(450);
      }
      updateCycleButtons(btnNight);
    });
  }

  function updateCycleButtons(activeBtn) {
    [btnDay, btnDusk, btnNight].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  // 9. Ações Cidade: Pedestres e Veículos
  const btnSpawnEast = document.getElementById('btn-spawn-pedestrian-east');
  if (btnSpawnEast) {
    btnSpawnEast.addEventListener('click', () => {
      streetScene.actors.spawnPedestrian(1);
    });
  }

  const btnSpawnWest = document.getElementById('btn-spawn-pedestrian-west');
  if (btnSpawnWest) {
    btnSpawnWest.addEventListener('click', () => {
      streetScene.actors.spawnPedestrian(-1);
    });
  }

  const btnClearPeds = document.getElementById('btn-clear-pedestrians');
  if (btnClearPeds) {
    btnClearPeds.addEventListener('click', () => {
      streetScene.actors.clearAllPedestrians();
    });
  }

  const btnSpawnCar = document.getElementById('btn-spawn-car');
  if (btnSpawnCar) {
    btnSpawnCar.addEventListener('click', () => {
      streetScene.actors.triggerCar();
    });
  }

  const btnAllPirs = document.getElementById('btn-all-pirs');
  if (btnAllPirs) {
    btnAllPirs.addEventListener('click', () => {
      for (let i = 0; i < 6; i++) {
        controller.triggerManualPIR(i, true);
      }
    });
  }

  const btnClearPirs = document.getElementById('btn-clear-pirs');
  if (btnClearPirs) {
    btnClearPirs.addEventListener('click', () => {
      controller.resetAllPIRs();
    });
  }

  // 10. Ações Maquete: Mão 3D na Bancada (Botões e Roda de Luz)
  const btnHandTurnLight = document.getElementById('btn-hand-turn-light');
  if (btnHandTurnLight) {
    btnHandTurnLight.addEventListener('click', () => {
      const target = controller.isDay ? 450 : 3600;
      maqueteScene.adjustLightWheelWithHand(target);
    });
  }

  const btnHandLightDay = document.getElementById('btn-hand-light-day');
  if (btnHandLightDay) {
    btnHandLightDay.addEventListener('click', () => {
      maqueteScene.adjustLightWheelWithHand(3600);
    });
  }

  const btnHandLightNight = document.getElementById('btn-hand-light-night');
  if (btnHandLightNight) {
    btnHandLightNight.addEventListener('click', () => {
      maqueteScene.adjustLightWheelWithHand(450);
    });
  }

  const btnHandWalk = document.getElementById('btn-hand-walk');
  if (btnHandWalk) {
    btnHandWalk.addEventListener('click', () => {
      maqueteScene.startHandWalkSequence();
    });
  }

  for (let i = 1; i <= 6; i++) {
    const btn = document.getElementById(`btn-hand-p${i}`);
    if (btn) {
      btn.addEventListener('click', () => {
        maqueteScene.clickButtonWithHand(i - 1);
      });
    }
  }

  // 11. Câmeras Cidade & Maquete
  const cameraCityBtns = document.querySelectorAll('.camera-btn');
  cameraCityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cameraCityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      streetScene.setCameraPreset(btn.dataset.preset);
    });
  });

  const cameraMaqueteBtns = document.querySelectorAll('.camera-maquete-btn');
  cameraMaqueteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cameraMaqueteBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      maqueteScene.setCameraPreset(btn.dataset.preset);
    });
  });

  const checkPirZones = document.getElementById('check-pir-zones');
  if (checkPirZones) {
    checkPirZones.addEventListener('change', (e) => {
      streetScene.togglePirZones(e.target.checked);
    });
  }

  // 12. Terminal Serial ESP32
  const serialTerminal = document.getElementById('serial-terminal');
  const btnToggleJson = document.getElementById('btn-serial-json');
  const btnClearSerial = document.getElementById('btn-clear-serial');

  if (btnToggleJson) {
    btnToggleJson.addEventListener('click', () => {
      controller.jsonMode = !controller.jsonMode;
      btnToggleJson.classList.toggle('active', controller.jsonMode);
    });
  }

  if (btnClearSerial) {
    btnClearSerial.addEventListener('click', () => {
      controller.serialLogs = [];
      if (serialTerminal) serialTerminal.innerHTML = '';
    });
  }

  // 13. Modais (Código C++, Diagrama Wokwi, Ajustes)
  setupModals(controller);

  // 14. Criação das Etiquetas 3D Flutuantes sobre os Postes da Cidade
  const tagsContainer = document.getElementById('pole-3d-tags-container');
  const floatingTags = [];
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const tag = document.createElement('div');
      tag.className = 'pole-3d-tag tag-30';
      tag.id = `floating-tag-${i + 1}`;
      tag.innerHTML = `P${i + 1}: 30%`;
      tagsContainer.appendChild(tag);
      floatingTags.push(tag);
    }
  }

  // Spawna 1 pedestre inicial após breve pausa
  setTimeout(() => {
    if (streetScene.actors) {
      streetScene.actors.spawnPedestrian(1);
    }
  }, 600);

  // 15. Loop Principal de Animação e Renderização
  let lastTime = performance.now();
  let lastDelta = 0;
  let lastSupabaseSyncAt = 0;

  function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    lastDelta = delta;

    // Atualiza lógica central do ESP32 (compartilhada entre ambos os simuladores)
    controller.update(delta);

    // Publica o estado calculado pelo controlador uma vez por segundo.
    // A função é um no-op até js/supabase-config.js receber as credenciais públicas.
    if (currentTime - lastSupabaseSyncAt >= 1000) {
      lastSupabaseSyncAt = currentTime;
      if (window.LuzSmartSupabaseSync) {
        window.LuzSmartSupabaseSync.publish({
          ldrValue: controller.ldrValue,
          pirStates: controller.pirState.slice(),
          poleIntensities: controller.smartPolesPWM.slice()
        });
      }
    }

    // Renderiza a cena ativa
    if (currentApp === 'city') {
      streetScene.update(delta);
      updateFloatingTags(streetScene, floatingTags, controller);
    } else {
      maqueteScene.update(delta);
    }

    // Atualiza HUD e Telemetria
    updateHud(controller, streetScene);
  }

  function updateHud(ctrl, scene) {
    const seconds = Math.floor(ctrl.virtualMillis / 1000);
    const msRemainder = ctrl.virtualMillis % 1000;
    if (virtualClockText) {
      virtualClockText.innerText = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}.${String(Math.floor(msRemainder / 100))}`;
    }

    if (pedCountBadge && scene.actors) {
      pedCountBadge.innerText = scene.actors.getPedestrianCount();
    }

    if (statusEnvPill && statusEnvText) {
      if (ctrl.isDay) {
        statusEnvPill.className = 'menubar-pill day';
        statusEnvText.innerText = 'DIA (0% PWM)';
      } else {
        statusEnvPill.className = 'menubar-pill night';
        statusEnvText.innerText = 'NOITE (PWM Ativo)';
      }
    }

    if (statusSavedPercent) {
      statusSavedPercent.innerText = `${ctrl.savedPercent.toFixed(1)}%`;
    }

    if (ldrValueText) {
      ldrValueText.innerText = `${ctrl.ldrValue} ADC`;
    }

    if (ldrLuxText) {
      const luxEstimate = Math.round((ctrl.ldrValue / 4095) * 1000);
      ldrLuxText.innerText = `${luxEstimate} lux`;
    }

    // Atualizar PIR Cards
    for (let i = 0; i < 6; i++) {
      if (!pirCards[i]) continue;
      const isActivelyDetecting = ctrl.pirState[i];
      const remainingSec = ctrl.getPirTimeRemaining(i);
      const isInHold = !isActivelyDetecting && (remainingSec > 0);

      pirCards[i].classList.toggle('active', isActivelyDetecting);
      pirCards[i].classList.toggle('in-hold', isInHold);

      const percentRemaining = (remainingSec / (ctrl.holdTimeMs / 1000)) * 100;
      if (pirTimers[i] && pirTimers[i].fill) {
        pirTimers[i].fill.style.width = isActivelyDetecting ? '100%' : `${percentRemaining}%`;
      }

      if (pirTimers[i] && pirTimers[i].text) {
        if (isActivelyDetecting) {
          pirTimers[i].text.innerText = 'DETECÇÃO';
        } else if (remainingSec > 0) {
          pirTimers[i].text.innerText = `${remainingSec.toFixed(1)}s hold`;
        } else {
          pirTimers[i].text.innerText = 'Repouso';
        }
      }
    }

    // Atualizar Barras de Status dos Postes
    for (let i = 0; i < 6; i++) {
      if (!poleValTexts[i] || !poleProgressFills[i]) continue;
      const pwm = ctrl.smartPolesPWM[i];
      poleValTexts[i].innerText = `${pwm}%`;
      poleProgressFills[i].style.width = `${pwm}%`;

      if (poleRows[i]) {
        poleRows[i].className = `pole-row state-${pwm}`;
      }

      if (pwm === 100) {
        poleProgressFills[i].style.backgroundColor = '#f59e0b';
      } else if (pwm === 60) {
        poleProgressFills[i].style.backgroundColor = '#06b6d4';
      } else if (pwm === 30) {
        poleProgressFills[i].style.backgroundColor = '#3b82f6';
      } else {
        poleProgressFills[i].style.backgroundColor = '#334155';
      }
    }

    // Atualizar Dashboard de Energia & Economia
    energyDashboard.update(lastDelta);

    // Atualizar Terminal Serial
    if (serialTerminal && ctrl.serialLogs.length > 0) {
      serialTerminal.innerHTML = ctrl.serialLogs.slice(0, 16).map(log => {
        return `<div class="log-line log-${log.type}">${log.timestamp} ${escapeHtml(log.text)}</div>`;
      }).join('');
    }
  }

  function updateFloatingTags(scene, tags, ctrl) {
    if (!tags || tags.length === 0) return;
    const tempV = new THREE.Vector3();

    scene.smartPoles.forEach((pole, i) => {
      if (!tags[i]) return;
      tempV.copy(pole.worldPosition);
      tempV.project(scene.camera);

      const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;

      const tag = tags[i];
      if (tempV.z < 1) {
        tag.style.display = 'block';
        tag.style.left = `${x}px`;
        tag.style.top = `${y}px`;

        const pwm = ctrl.smartPolesPWM[i];
        tag.innerText = `P${i + 1}: ${pwm}%`;
        tag.className = `pole-3d-tag tag-${pwm}`;
      } else {
        tag.style.display = 'none';
      }
    });
  }

  animate();
});

function setupModals(controller) {
  // Modal de Código C++
  const modalCode = document.getElementById('modal-code');
  const btnCloseCode = document.getElementById('btn-close-code');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const codeViewer = document.getElementById('arduino-code-viewer');

  const openCodeTriggers = [
    document.getElementById('btn-open-code'),
    document.getElementById('dock-btn-code'),
    document.getElementById('menu-view-code')
  ];

  fetch('iluminacao_inteligente_esp32.ino')
    .then(res => res.text())
    .then(code => {
      if (codeViewer) codeViewer.innerText = code;
    })
    .catch(() => {
      if (codeViewer) codeViewer.innerText = '// iluminacao_inteligente_esp32.ino carregado com sucesso.';
    });

  openCodeTriggers.forEach(btn => {
    if (btn && modalCode) {
      btn.addEventListener('click', () => modalCode.classList.add('open'));
    }
  });

  if (btnCloseCode && modalCode) {
    btnCloseCode.addEventListener('click', () => modalCode.classList.remove('open'));
  }

  if (modalCode) {
    modalCode.addEventListener('click', (e) => {
      if (e.target === modalCode) modalCode.classList.remove('open');
    });
  }

  if (btnCopyCode && codeViewer) {
    btnCopyCode.addEventListener('click', () => {
      navigator.clipboard.writeText(codeViewer.innerText).then(() => {
        const originalText = btnCopyCode.innerHTML;
        btnCopyCode.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        setTimeout(() => { btnCopyCode.innerHTML = originalText; }, 2000);
      });
    });
  }

  // Modal Wokwi
  const modalWokwi = document.getElementById('modal-wokwi');
  const btnCloseWokwi = document.getElementById('btn-close-wokwi');
  const btnCopyDiagram = document.getElementById('btn-copy-diagram');

  const openWokwiTriggers = [
    document.getElementById('dock-btn-wokwi'),
    document.getElementById('menu-view-wokwi')
  ];

  openWokwiTriggers.forEach(btn => {
    if (btn && modalWokwi) {
      btn.addEventListener('click', () => modalWokwi.classList.add('open'));
    }
  });

  if (btnCloseWokwi && modalWokwi) {
    btnCloseWokwi.addEventListener('click', () => modalWokwi.classList.remove('open'));
  }

  if (modalWokwi) {
    modalWokwi.addEventListener('click', (e) => {
      if (e.target === modalWokwi) modalWokwi.classList.remove('open');
    });
  }

  if (btnCopyDiagram) {
    btnCopyDiagram.addEventListener('click', () => {
      fetch('diagram.json')
        .then(res => res.text())
        .then(jsonText => {
          navigator.clipboard.writeText(jsonText).then(() => {
            const orig = btnCopyDiagram.innerHTML;
            btnCopyDiagram.innerHTML = '<i class="fa-solid fa-check"></i> JSON Copiado!';
            setTimeout(() => { btnCopyDiagram.innerHTML = orig; }, 2000);
          });
        });
    });
  }

  // Modal Ajustes
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const openSettingsTriggers = [
    document.getElementById('btn-open-settings'),
    document.getElementById('dock-btn-settings')
  ];

  const inputBase = document.getElementById('cfg-base-pwm');
  const inputNeighbor = document.getElementById('cfg-neighbor-pwm');
  const inputMain = document.getElementById('cfg-main-pwm');
  const inputHold = document.getElementById('cfg-hold-time');
  const inputThreshold = document.getElementById('cfg-ldr-threshold');

  openSettingsTriggers.forEach(btn => {
    if (btn && modalSettings) {
      btn.addEventListener('click', () => {
        if (inputBase) inputBase.value = controller.intensityBase;
        if (inputNeighbor) inputNeighbor.value = controller.intensityNeighbor;
        if (inputMain) inputMain.value = controller.intensityMain;
        if (inputHold) inputHold.value = controller.holdTimeMs / 1000;
        if (inputThreshold) inputThreshold.value = controller.ldrThreshold;
        modalSettings.classList.add('open');
      });
    }
  });

  if (btnCloseSettings && modalSettings) {
    btnCloseSettings.addEventListener('click', () => {
      if (inputBase) controller.intensityBase = Number(inputBase.value);
      if (inputNeighbor) controller.intensityNeighbor = Number(inputNeighbor.value);
      if (inputMain) controller.intensityMain = Number(inputMain.value);
      if (inputHold) controller.holdTimeMs = Number(inputHold.value) * 1000;
      if (inputThreshold) controller.ldrThreshold = Number(inputThreshold.value);
      modalSettings.classList.remove('open');
    });
  }

  if (modalSettings) {
    modalSettings.addEventListener('click', (e) => {
      if (e.target === modalSettings) modalSettings.classList.remove('open');
    });
  }
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

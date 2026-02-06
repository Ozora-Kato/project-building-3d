import { floors } from '../content/floorData.js';

// Icons for different content types (SVG paths)
const icons = {
  contact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  company: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
  careers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  team: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
  casestudy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>`,
  service: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  about: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
};

export class UIOverlay {
  constructor() {
    this.backdrop = document.getElementById('room-backdrop');
    this.container = document.getElementById('room-container');
    this.contentPanel = document.getElementById('room-content');
    this.contentBody = document.getElementById('room-body');
    this.backBtn = document.getElementById('back-btn');
    this.elevatorPanel = document.getElementById('elevator-panel');
    this.elevatorPanelMobile = document.getElementById('elevator-panel-mobile');

    this.onBack = null;
    this.onFloorChange = null;
    this.currentFloorIndex = null;
    this.isTransitioning = false;

    // Back button click
    this.backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onBack && !this.isTransitioning) this.onBack();
    });

    // Click outside cards to close
    this.backdrop.addEventListener('click', () => {
      if (this.onBack && !this.isTransitioning) this.onBack();
    });

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container && !this.isTransitioning) {
        if (this.onBack) this.onBack();
      }
    });

    // Build elevator panels
    this.buildElevatorPanels();
  }

  buildElevatorPanels() {
    // Reversed order (RF at top, 1F at bottom)
    const reversedFloors = [...floors].reverse();

    // Desktop panel
    let panelHTML = '<div class="elevator-buttons">';
    reversedFloors.forEach((floor, idx) => {
      const actualIndex = floors.length - 1 - idx;
      const label = floor.name || 'RF';
      panelHTML += `
        <button class="elevator-btn" data-floor="${actualIndex}" data-color="${floor.cssColor}">
          <span class="elevator-btn-label">${label}</span>
        </button>
      `;
    });
    panelHTML += '</div>';
    this.elevatorPanel.innerHTML = panelHTML;

    // Mobile panel (same structure)
    this.elevatorPanelMobile.innerHTML = panelHTML;

    // Add click handlers
    this.elevatorPanel.querySelectorAll('.elevator-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleElevatorClick(e));
    });
    this.elevatorPanelMobile.querySelectorAll('.elevator-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleElevatorClick(e));
    });
  }

  handleElevatorClick(e) {
    e.stopPropagation();
    if (this.isTransitioning) return;

    const floorIndex = parseInt(e.currentTarget.dataset.floorIndex || e.currentTarget.dataset.floor);
    if (floorIndex === this.currentFloorIndex) return;

    this.transitionToFloor(floorIndex);
  }

  transitionToFloor(newFloorIndex) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const direction = newFloorIndex > this.currentFloorIndex ? 'up' : 'down';

    // Animate out current content
    gsap.to(this.contentBody, {
      opacity: 0,
      y: direction === 'up' ? -30 : 30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        // Update content
        this.currentFloorIndex = newFloorIndex;
        const floor = floors[newFloorIndex];
        if (!floor) {
          this.isTransitioning = false;
          return;
        }

        const cssColor = floor.cssColor;
        this.contentPanel.style.setProperty('--floor-color', cssColor);
        this.contentBody.innerHTML = this.generateContent(floor);
        this.updateElevatorHighlight(newFloorIndex);

        // Animate in new content
        gsap.fromTo(this.contentBody,
          { opacity: 0, y: direction === 'up' ? 30 : -30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              this.isTransitioning = false;
            }
          }
        );

        // Animate cards
        const cards = this.contentBody.querySelectorAll('.content-card');
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { opacity: 0, y: 15, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              delay: 0.1,
              stagger: 0.05,
              ease: 'power2.out'
            }
          );
        }

        // Notify floor change for camera movement
        if (this.onFloorChange) {
          this.onFloorChange(newFloorIndex);
        }
      }
    });
  }

  updateElevatorHighlight(floorIndex) {
    // Update both panels
    [this.elevatorPanel, this.elevatorPanelMobile].forEach(panel => {
      panel.querySelectorAll('.elevator-btn').forEach(btn => {
        const btnFloor = parseInt(btn.dataset.floor);
        if (btnFloor === floorIndex) {
          btn.classList.add('active');
          btn.style.setProperty('--btn-color', btn.dataset.color);
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

  showContent(floorIndex) {
    const floor = floors[floorIndex];
    if (!floor) return;

    this.currentFloorIndex = floorIndex;
    const cssColor = floor.cssColor;
    this.contentPanel.style.setProperty('--floor-color', cssColor);

    this.contentBody.innerHTML = this.generateContent(floor);
    this.updateElevatorHighlight(floorIndex);

    // Show backdrop, elevator, and content
    this.backdrop.classList.add('active');
    this.container.classList.add('active');
    this.contentPanel.classList.add('active');
    this.elevatorPanel.classList.add('active');

    gsap.fromTo(this.backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    gsap.fromTo(this.contentPanel,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
    );

    // Animate elevator panel
    gsap.fromTo(this.elevatorPanel,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, delay: 0.3, ease: 'power2.out' }
    );

    // Animate cards with stagger
    const cards = this.contentBody.querySelectorAll('.content-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          delay: 0.3,
          stagger: 0.08,
          ease: 'power2.out'
        }
      );
    }
  }

  hideContent() {
    gsap.to(this.contentPanel, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
    });

    gsap.to(this.elevatorPanel, {
      opacity: 0,
      x: 20,
      duration: 0.3,
      ease: 'power2.in',
    });

    gsap.to(this.backdrop, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.backdrop.classList.remove('active');
        this.container.classList.remove('active');
        this.contentPanel.classList.remove('active');
        this.elevatorPanel.classList.remove('active');
        this.currentFloorIndex = null;
      },
    });
  }

  getIcon(type) {
    return icons[type] || icons.default;
  }

  generateContent(floor) {
    const c = floor.content;
    const icon = this.getIcon(floor.type);

    // Header section with title
    let header = `
      <div class="content-header">
        <div class="content-icon">${icon}</div>
        <h1>${c.title}</h1>
        <h2>${c.subtitle}</h2>
      </div>
    `;

    // Generate cards based on content type
    let cards = '';

    switch (floor.type) {
      case 'about':
        // Mission/Vision/Values - parse body into separate cards
        const sections = this.parseAboutContent(c.body);
        cards = `
          <div class="cards-grid cards-about">
            ${sections.map((section, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getAboutIcon(i)}</div>
                <div class="card-content">
                  <h3>${section.title}</h3>
                  <p>${section.body}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'service':
        cards = `
          <div class="cards-grid">
            ${c.bullets.map((bullet, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getServiceIcon(i)}</div>
                <div class="card-content">
                  <p>${bullet}</p>
                </div>
              </div>
            `).join('')}
          </div>
          ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
        `;
        break;

      case 'casestudy':
        cards = `
          ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
          <div class="cards-grid">
            ${c.bullets.map((bullet, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getCaseStudyIcon(i)}</div>
                <div class="card-content">
                  <p>${bullet}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'team':
        if (c.members) {
          cards = `
            <div class="cards-grid cards-team">
              ${c.members.map(m => `
                <div class="content-card card-team">
                  <div class="team-avatar">${m.initial}</div>
                  <div class="card-content">
                    <h3>${m.name}</h3>
                    <p class="team-role">${m.role}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        break;

      case 'careers':
        cards = `
          ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
          <div class="cards-grid">
            ${c.bullets.map((bullet, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getCareerIcon(i)}</div>
                <div class="card-content">
                  <p>${bullet}</p>
                </div>
              </div>
            `).join('')}
          </div>
          ${c.cta ? `<div class="content-cta"><a class="cta-btn" href="${c.cta.url}">${c.cta.text}</a></div>` : ''}
        `;
        break;

      case 'contact':
        cards = `
          ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
          <div class="cards-grid">
            ${c.bullets.map((bullet, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getContactIcon(i)}</div>
                <div class="card-content">
                  <p>${bullet}</p>
                </div>
              </div>
            `).join('')}
          </div>
          ${c.cta ? `<div class="content-cta"><a class="cta-btn" href="${c.cta.url}">${c.cta.text}</a></div>` : ''}
        `;
        break;

      case 'company':
        cards = `
          ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
          <div class="cards-grid">
            ${c.bullets.map((bullet, i) => `
              <div class="content-card">
                <div class="card-icon">${this.getCompanyIcon(i)}</div>
                <div class="card-content">
                  <p>${bullet}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      default:
        if (c.bullets) {
          cards = `
            ${c.body ? `<p class="content-description">${c.body}</p>` : ''}
            <div class="cards-grid">
              ${c.bullets.map(bullet => `
                <div class="content-card">
                  <div class="card-icon">${icon}</div>
                  <div class="card-content">
                    <p>${bullet}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          cards = `<p class="content-description">${c.body || ''}</p>`;
        }
    }

    return header + cards;
  }

  parseAboutContent(body) {
    // Parse the about body into sections
    const lines = body.split('\n').filter(l => l.trim());
    const sections = [];
    let currentSection = null;

    for (const line of lines) {
      if (line.includes('MISSION') || line.includes('VISION') || line.includes('VALUES')) {
        if (currentSection) sections.push(currentSection);
        const [title, ...rest] = line.split('—').map(s => s.trim());
        currentSection = { title: title.replace(/[・]/g, '').trim(), body: rest.join('—').trim() };
      } else if (line.startsWith('・') || line.startsWith('•')) {
        if (currentSection) {
          currentSection.body += (currentSection.body ? '\n' : '') + line;
        }
      } else if (currentSection) {
        currentSection.body += ' ' + line.trim();
      } else {
        sections.push({ title: 'Overview', body: line });
      }
    }
    if (currentSection) sections.push(currentSection);

    return sections.length > 0 ? sections : [{ title: 'About', body }];
  }

  getAboutIcon(index) {
    const aboutIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    ];
    return aboutIcons[index] || aboutIcons[0];
  }

  getServiceIcon(index) {
    const serviceIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    ];
    return serviceIcons[index % serviceIcons.length];
  }

  getCaseStudyIcon(index) {
    const caseIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    ];
    return caseIcons[index % caseIcons.length];
  }

  getCareerIcon(index) {
    const careerIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    ];
    return careerIcons[index % careerIcons.length];
  }

  getContactIcon(index) {
    const contactIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    ];
    return contactIcons[index % contactIcons.length];
  }

  getCompanyIcon(index) {
    const companyIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
    ];
    return companyIcons[index % companyIcons.length];
  }
}

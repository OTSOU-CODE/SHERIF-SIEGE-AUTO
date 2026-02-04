/**
 * Staggered Menu Component for Vanilla JS
 * Adapts React StaggeredMenu to pure JS + GSAP
 */
export class StaggeredMenu {
    constructor(options = {}) {
        this.options = {
            target: document.body,
            position: 'right', // 'right' or 'left'
            colors: ['#B19EEF', '#5227FF'],
            items: [], // { label, link }
            socialItems: [], // { label, link }
            displaySocials: true,
            displayItemNumbering: true,
            logo: '', // New option for HTML logo content
            logoUrl: '',
            menuButtonColor: '#000',
            openMenuButtonColor: '#000',
            accentColor: '#5227FF',
            changeMenuColorOnOpen: true,
            isFixed: true,
            closeOnClickAway: true,
            onMenuOpen: null,
            onMenuClose: null,
            ...options
        };

        this.state = {
            open: false,
            textLines: ['Menu', 'Close']
        };

        this.refs = {
            wrapper: null,
            panel: null,
            preLayers: [],
            toggleBtn: null,
            icon: null,
            plusH: null,
            plusV: null,
            textInner: null,
            textWrap: null
        };

        this.tweens = {
            openTl: null,
            closeTween: null,
            spinTween: null,
            textCycleAnim: null,
            colorTween: null,
            itemEntranceTween: null
        };

        this.busy = false;

        this.init();
    }

    init() {
        this.render();
        this.setupGSAP();
        this.addEventListeners();
        this.setupScrollListener();
    }

    render() {
        // Create Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = `staggered-menu-wrapper ${this.options.isFixed ? 'fixed-wrapper' : ''}`;
        wrapper.dataset.position = this.options.position;
        if (this.options.accentColor) {
            wrapper.style.setProperty('--sm-accent', this.options.accentColor);
        }

        // Pre-layers
        const preLayersHtml = this.getPreLayersHtml();

        // Header (Logo + Toggle)
        // Note: For existing site integration, we might want to inject this into existing header, 
        // but for now we follow the component structure which overlays a header.
        // We will position the toggle roughly where the nav-toggle usually is if needed, or just fixed.
        // Given the site design, let's keep it as is.

        const toggleHtml = `
            <header class="staggered-menu-header">
                <div class="sm-logo">
                     ${this.options.logoUrl ? `<img src="${this.options.logoUrl}" alt="Logo" class="sm-logo-img" width="110" height="24">` : (this.options.logo || '')}
                </div>
                <button class="sm-toggle" type="button" aria-label="Open menu">
                    <span class="sm-toggle-textWrap">
                        <span class="sm-toggle-textInner">
                             <span class="sm-toggle-line">Menu</span>
                             <span class="sm-toggle-line">Close</span>
                        </span>
                    </span>
                    <span class="sm-icon">
                        <span class="sm-icon-line"></span>
                        <span class="sm-icon-line sm-icon-line-v"></span>
                    </span>
                </button>
            </header>
        `;

        // Panel
        const itemsHtml = this.options.items.length ? 
            this.options.items.map((it, idx) => `
                <li class="sm-panel-itemWrap">
                    <a class="sm-panel-item" href="${it.link}">
                        <span class="sm-panel-itemLabel">${it.label}</span>
                    </a>
                </li>
            `).join('') :
            `<li class="sm-panel-itemWrap"><span class="sm-panel-item"><span class="sm-panel-itemLabel">No items</span></span></li>`;

        const socialsHtml = (this.options.displaySocials && this.options.socialItems.length) ? `
            <div class="sm-socials">
                <h3 class="sm-socials-title">Socials</h3>
                <ul class="sm-socials-list">
                    ${this.options.socialItems.map(s => `
                        <li class="sm-socials-item">
                            <a href="${s.link}" target="_blank" class="sm-socials-link">${s.label}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';

        const panelHtml = `
            <aside id="staggered-menu-panel" class="staggered-menu-panel" aria-hidden="true">
                <div class="sm-panel-inner">
                    <ul class="sm-panel-list" data-numbering="${this.options.displayItemNumbering ? 'true' : ''}">
                        ${itemsHtml}
                    </ul>
                    ${socialsHtml}
                </div>
            </aside>
        `;

        // Assemble
        wrapper.innerHTML = `
            <div class="sm-prelayers">${preLayersHtml}</div>
            ${toggleHtml}
            ${panelHtml}
        `;

        this.options.target.appendChild(wrapper);

        // Store Refs
        this.refs.wrapper = wrapper;
        this.refs.panel = wrapper.querySelector('.staggered-menu-panel');
        this.refs.preLayers = Array.from(wrapper.querySelectorAll('.sm-prelayer'));
        this.refs.toggleBtn = wrapper.querySelector('.sm-toggle');
        this.refs.icon = wrapper.querySelector('.sm-icon');
        this.refs.plusH = wrapper.querySelector('.sm-icon-line:not(.sm-icon-line-v)');
        this.refs.plusV = wrapper.querySelector('.sm-icon-line-v');
        this.refs.textInner = wrapper.querySelector('.sm-toggle-textInner');
        this.refs.textWrap = wrapper.querySelector('.sm-toggle-textWrap');
    }

    getPreLayersHtml() {
        let colors = this.options.colors && this.options.colors.length ? this.options.colors.slice(0, 4) : ['#1e1e22', '#35353c'];
        if (colors.length >= 3) {
            // Logic from React: remove middle one if >= 3?
            // "if (arr.length >= 3) { const mid = Math.floor(arr.length / 2); arr.splice(mid, 1); }"
            const mid = Math.floor(colors.length / 2);
            // Create copy to not mutate original
            colors = [...colors];
            colors.splice(mid, 1);
        }
        return colors.map(c => `<div class="sm-prelayer" style="background: ${c}"></div>`).join('');
    }

    setupGSAP() {
        if (typeof gsap === 'undefined') {
            console.error('GSAP is not loaded. StaggeredMenu requires GSAP.');
            return;
        }

        const { panel, preLayers, plusH, plusV, icon, textInner, toggleBtn } = this.refs;
        const offscreen = this.options.position === 'left' ? -100 : 100;

        gsap.set([panel, ...preLayers], { xPercent: offscreen });
        gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
        gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
        gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
        gsap.set(textInner, { yPercent: 0 });
        if (toggleBtn) gsap.set(toggleBtn, { color: this.options.menuButtonColor });
    }

    addEventListeners() {
        if (this.refs.toggleBtn) {
            this.refs.toggleBtn.addEventListener('click', () => this.toggleMenu());
        }

        if (this.options.closeOnClickAway) {
            document.addEventListener('mousedown', (e) => {
                if (this.state.open && 
                    this.refs.panel && 
                    !this.refs.panel.contains(e.target) && 
                    !this.refs.toggleBtn.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }
    }

    // --- Animation Logic ---

    buildOpenTimeline() {
        const { panel, preLayers } = this.refs;
        if (!panel) return null;

        if (this.tweens.openTl) this.tweens.openTl.kill();
        if (this.tweens.closeTween) {
            this.tweens.closeTween.kill();
            this.tweens.closeTween = null;
        }

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

        const panelStart = Number(gsap.getProperty(panel, 'xPercent'));
        
        // Reset states for enter animation
        // Flutter: Slide from right (150px) -> 0. Opacity 0 -> 1.
        if (itemEls.length) gsap.set(itemEls, { x: 150, opacity: 0, rotate: 0, yPercent: 0 }); // Reset rotate/yPercent from old anim
        if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        
        // Flutter Button: Scale 0.5 -> 1.0, Elastic
        if (socialLinks.length) gsap.set(socialLinks, { scale: 0.5, opacity: 0, y: 0 }); // Reset y from old anim

        const tl = gsap.timeline({ paused: true });

        // Layers animation (Keep existing pre-layers or speed them up slightly to match Flutter snap?)
        // Flutter example doesn't have pre-layers, but we keep them for style.
        preLayers.forEach((el, i) => {
            const start = Number(gsap.getProperty(el, 'xPercent'));
            tl.fromTo(el, { xPercent: start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
        });

        const lastTime = preLayers.length ? (preLayers.length - 1) * 0.07 : 0;
        const panelInsertTime = lastTime + (preLayers.length ? 0.08 : 0);
        const panelDuration = 0.65;
        
        tl.fromTo(
            panel,
            { xPercent: panelStart },
            { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
            panelInsertTime
        );

        // Items Entrance - Flutter Style
        // Curve: easeOut -> GSAP power2.out
        if (itemEls.length) {
            const itemsStartRatio = 0.3; // Start a bit later so panel is visible
            const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
            
            tl.to(itemEls, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                stagger: { each: 0.1, from: 'start' }
            }, itemsStart);

            if (numberEls.length) {
                tl.to(numberEls, {
                    duration: 0.6,
                    ease: 'power2.out',
                    '--sm-num-opacity': 1,
                    stagger: { each: 0.08, from: 'start' }
                }, itemsStart + 0.1);
            }
        }

        // Socials/Button Entrance - Flutter Style
        // Curve: elasticOut -> GSAP elastic.out(1, 0.5)
        if (socialTitle || socialLinks.length) {
            const socialsStart = panelInsertTime + panelDuration * 0.6;
            if (socialTitle) {
                tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
            }
            if (socialLinks.length) {
                // Approximate Elastic scale pop
                tl.to(socialLinks, {
                    scale: 1,
                    opacity: 1,
                    duration: 1.0, // Elastic needs more time to settle
                    ease: 'elastic.out(1, 0.5)',
                    stagger: { each: 0.08, from: 'start' },
                    onComplete: () => gsap.set(socialLinks, { clearProps: 'transform,opacity' }) // Clear to prevent blur?
                }, socialsStart + 0.1);
            }
        }

        this.tweens.openTl = tl;
        return tl;
    }

    playOpen() {
        if (this.busy) return;
        this.busy = true;
        const tl = this.buildOpenTimeline();
        if (tl) {
            tl.eventCallback('onComplete', () => {
                this.busy = false;
            });
            tl.play(0);
        } else {
            this.busy = false;
        }
    }

    playClose() {
        if (this.tweens.openTl) {
            this.tweens.openTl.kill();
            this.tweens.openTl = null;
        }
        
        const { panel, preLayers } = this.refs;
        if (!panel) return;

        const all = [...preLayers, panel];
        if (this.tweens.closeTween) this.tweens.closeTween.kill();
        
        const offscreen = this.options.position === 'left' ? -100 : 100;
        
        this.tweens.closeTween = gsap.to(all, {
            xPercent: offscreen,
            duration: 0.32,
            ease: 'power3.in',
            overwrite: 'auto',
            onComplete: () => {
                this.busy = false;
                // Reset elements hidden
                const socialTitle = panel.querySelector('.sm-socials-title');
                if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
            }
        });
    }

    animateIcon(opening) {
        const { icon } = this.refs;
        if (!icon) return;
        if (this.tweens.spinTween) this.tweens.spinTween.kill();
        
        if (opening) {
            this.tweens.spinTween = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
        } else {
            this.tweens.spinTween = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        }
    }

    animateColor(opening) {
        const btn = this.refs.toggleBtn;
        if (!btn) return;
        if (this.tweens.colorTween) this.tweens.colorTween.kill();

        if (this.options.changeMenuColorOnOpen) {
            const targetColor = opening ? this.options.openMenuButtonColor : this.options.menuButtonColor;
            this.tweens.colorTween = gsap.to(btn, {
                color: targetColor,
                delay: 0.18,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }

    animateText(opening) {
        const inner = this.refs.textInner;
        if (!inner) return;
        if (this.tweens.textCycleAnim) this.tweens.textCycleAnim.kill();

        const currentLabel = opening ? 'Menu' : 'Close';
        const targetLabel = opening ? 'Close' : 'Menu';
        
        // Build sequence in DOM? 
        // In Vanilla, we can just rebuild the innerHTML or offset translate.
        // React version builds a list 'Menu, Close, Menu, Close' and slides it.
        // Let's replicate this dynamic text construction.
        
        const cycles = 3;
        let seq = [currentLabel];
        let last = currentLabel;
        for (let i = 0; i < cycles; i++) {
           last = last === 'Menu' ? 'Close' : 'Menu';
           seq.push(last);
        }
        if (last !== targetLabel) seq.push(targetLabel);
        seq.push(targetLabel);
        
        // Rebuild DOM
        inner.innerHTML = seq.map(l => `<span class="sm-toggle-line">${l}</span>`).join('');
        
        gsap.set(inner, { yPercent: 0 });
        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;
        
        this.tweens.textCycleAnim = gsap.to(inner, {
            yPercent: -finalShift,
            duration: 0.5 + lineCount * 0.07,
            ease: 'power4.out'
        });
    }

    toggleMenu() {
        if (this.busy) return; // Prevent spamming
        this.state.open = !this.state.open;
        const isOpen = this.state.open;
        
        // Update dataset
        this.refs.wrapper.dataset.open = isOpen ? 'true' : '';
        this.refs.panel.setAttribute('aria-hidden', !isOpen);
        this.refs.toggleBtn.setAttribute('aria-expanded', isOpen);
        this.refs.toggleBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

        if (isOpen) {
            if (this.options.onMenuOpen) this.options.onMenuOpen();
            this.playOpen();
        } else {
            if (this.options.onMenuClose) this.options.onMenuClose();
            this.playClose();
        }

        this.animateIcon(isOpen);
        this.animateColor(isOpen);
        this.animateText(isOpen);
    }
    
    setupScrollListener() {
        // Sticky Header Logic
        const header = this.refs.wrapper.querySelector('.staggered-menu-header');
        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
    }

    closeMenu() {
        if (this.state.open) {
           this.toggleMenu();
        }
    }
}

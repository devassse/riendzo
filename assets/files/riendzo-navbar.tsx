'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './riendzo-navbar.module.css';
import { NAV_SECTIONS } from './riendzo-nav-data';
import logo from '../public/riendzo-logo.png';

type IndicatorRect = { left: number; width: number };

export default function RiendzoNavbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const navItemsRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionIndicator = (id: string) => {
    const wrap = navItemsRef.current;
    const trigger = triggerRefs.current[id];
    if (!wrap || !trigger) return;
    const wrapRect = wrap.getBoundingClientRect();
    const r = trigger.getBoundingClientRect();
    setIndicator({ left: r.left - wrapRect.left + 8, width: r.width - 16 });
  };

  const openItem = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
    positionIndicator(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      setIndicator(null);
    }, 160);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setIndicator(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toggleMobileSection = (id: string) => {
    setMobileSection((cur) => (cur === id ? null : id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.navWrap}>
        <nav className={styles.navbar}>
          <div className={styles.brand}>
            <Image src={logo} alt="Riendzo — Assistente de Viagens" height={34} priority />
          </div>

          <div className={styles.navItems} ref={navItemsRef} onMouseLeave={scheduleClose}>
            {indicator && (
              <span
                className={styles.navIndicator}
                style={{
                  width: indicator.width,
                  transform: `translateX(${indicator.left}px)`,
                  opacity: 1,
                }}
              />
            )}

            {NAV_SECTIONS.map((section) => (
              <div
                key={section.id}
                className={`${styles.navItem} ${openMenu === section.id ? styles.open : ''}`}
                onMouseEnter={() => openItem(section.id)}
              >
                <button
                  ref={(el) => {
                    triggerRefs.current[section.id] = el;
                  }}
                  className={styles.navTrigger}
                  onFocus={() => openItem(section.id)}
                  onClick={() => {
                    if (openMenu === section.id) {
                      setOpenMenu(null);
                      setIndicator(null);
                    } else {
                      openItem(section.id);
                    }
                  }}
                >
                  {section.emoji} {section.label}
                  <i className={styles.chev} />
                </button>

                <div className={styles.mega}>
                  {section.links.map((link) => (
                    <a key={link.title} className={styles.megaLink} href={link.href}>
                      <span className={styles.megaIcon}>{link.icon}</span>
                      <span className={styles.megaText}>
                        <h4>{link.title}</h4>
                        <p>{link.desc}</p>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className={styles.aiPill} onClick={() => alert('Riendzo AI: "Olá! Posso ajudar-te a planear a tua viagem por Moçambique." 🤖')}>
            <span className={styles.aiDot} /> Riendzo AI
          </button>

          <button
            className={`${styles.burger} ${mobileOpen ? styles.active : ''}`}
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className={styles.burgerBar} />
          </button>
        </nav>

        {mobileOpen && (
          <div className={styles.mobilePanel}>
            {NAV_SECTIONS.map((section) => (
              <div
                key={section.id}
                className={`${styles.mItem} ${mobileSection === section.id ? styles.open : ''}`}
              >
                <button className={styles.mTrigger} onClick={() => toggleMobileSection(section.id)}>
                  {section.emoji} {section.label}
                  <i className={styles.mChev} />
                </button>
                <div className={styles.mSub}>
                  {section.links.map((link) => (
                    <a key={link.title} href={link.href}>
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div className={styles.mItem}>
              <a href="#" className={styles.mAiLink}>
                🤖 Riendzo AI
              </a>
            </div>
          </div>
        )}
      </div>

      <div className={styles.hero}>
        <span className={styles.eyebrow}>🇲🇿 Moçambique numa só plataforma</span>
        <h1>
          História, cultura e serviços — <span>tudo o que é moçambicano, num só lugar.</span>
        </h1>
        <p>
          Explore a barra de navegação acima: cada secção abre um submenu com atalhos diretos, ao estilo dos
          grandes produtos de tecnologia.
        </p>
      </div>

      <p className={styles.footnote}>Passe o rato ou toque em cada item da barra para ver o submenu.</p>
    </div>
  );
}

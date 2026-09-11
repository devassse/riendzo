'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
// import navStyles from '../../../css/navbar.module.css';
import navStyles from '@/app/css/navbar.module.css';
import { NAV_SECTIONS } from '../../utils/riendzo-nav-data';

type IndicatorRect = {
  left: number;
  width: number;
};

export default function RiendzoNavbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const navItemsRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionIndicator = (id: string) => {
    const wrap = navItemsRef.current;
    const trigger = triggerRefs.current[id];

    if (!wrap || !trigger) return;

    const wrapRect = wrap.getBoundingClientRect();
    const r = trigger.getBoundingClientRect();

    setIndicator({
      left: r.left - wrapRect.left + 8,
      width: r.width - 16,
    });
  };

  const openItem = (id: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setOpenMenu(id);
    positionIndicator(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

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

    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Go full-width once the hero section (#home) has fully scrolled out of view.
  useEffect(() => {
    const heroEl = document.getElementById('home');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting is false both before the hero mounts into view and
        // after it scrolls away — boundingClientRect.top < 0 tells us it's
        // specifically scrolled *past* (its bottom has gone above the viewport),
        // not that we're above it.
        setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  const toggleMobileSection = (id: string) => {
    setMobileSection((cur) => (cur === id ? null : id));
  };

  return (
    <header
      className={`${navStyles.navWrap} ${scrolled ? navStyles.scrolled : ''}`}
    >
      <nav className={navStyles.navbar}>
        <div className={navStyles.brand}>
          <Image
            src="/logo/logo-slogan-horizontal.webp"
            alt="Riendzo — Assistente de Viagens"
            width={100}
            height={42}
            priority
          />
        </div>

        <div
          className={navStyles.navItems}
          ref={navItemsRef}
          onMouseLeave={scheduleClose}
        >
          {indicator && (
            <span
              className={navStyles.navIndicator}
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
              className={`${navStyles.navItem} ${
                openMenu === section.id ? navStyles.open : ''
              }`}
              onMouseEnter={() => openItem(section.id)}
            >
              <button
                ref={(el) => {
                  triggerRefs.current[section.id] = el;
                }}
                className={navStyles.navTrigger}
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
                <i className={navStyles.chev} />
              </button>

              <div className={navStyles.mega}>
                {section.links.map((link) => (
                  <a
                    key={link.title}
                    className={navStyles.megaLink}
                    href={link.href}
                  >
                    <span className={navStyles.megaIcon}>
                      {link.icon}
                    </span>

                    <span className={navStyles.megaText}>
                      <h4>{link.title}</h4>
                      <p>{link.desc}</p>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          className={navStyles.aiPill}
          onClick={() =>
            alert(
              'Riendzo AI: "Olá! Posso ajudar-te a planear a tua viagem por Moçambique." 🤖'
            )
          }
        >
          <span className={navStyles.aiDot} />
          Riendzo AI
        </button>

        <button
          className={`${navStyles.burger} ${
            mobileOpen ? navStyles.active : ''
          }`}
          aria-label="Abrir menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={navStyles.burgerBar} />
        </button>
      </nav>

      {mobileOpen && (
        <div className={navStyles.mobilePanel}>
          {NAV_SECTIONS.map((section) => (
            <div
              key={section.id}
              className={`${navStyles.mItem} ${
                mobileSection === section.id ? navStyles.open : ''
              }`}
            >
              <button
                className={navStyles.mTrigger}
                onClick={() => toggleMobileSection(section.id)}
              >
                {section.emoji} {section.label}
                <i className={navStyles.mChev} />
              </button>

              <div className={navStyles.mSub}>
                {section.links.map((link) => (
                  <a key={link.title} href={link.href}>
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div className={navStyles.mItem}>
            <a href="#" className={navStyles.mAiLink}>
              🤖 Riendzo AI
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
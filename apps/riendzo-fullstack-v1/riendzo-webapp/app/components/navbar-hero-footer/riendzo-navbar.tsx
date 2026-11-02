'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import navStyles from '@/app/css/navbar.module.css';
import { NAV_SECTIONS } from '../utils/riendzo-nav-data';
import { useNavFlags } from '../utils/nav-flags';
import { useLocale } from 'next-intl';
import RiendzoTopbar from './riendzo-topbar';

type IndicatorRect = {
  left: number;
  width: number;
};

export default function RiendzoNavbar() {
  const flags = useNavFlags();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

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

  const switchLanguage = (locale: 'pt' | 'en' | 'ts' | 'se' | 'kh') => {
    router.replace(pathname, { locale });
    setLanguageOpen(false);
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
    <>
    <RiendzoTopbar />
    <header
      className={`${navStyles.navWrap} ${scrolled ? navStyles.scrolled : ''}`}
    >
      <nav className={navStyles.navbar}>
        <Link href="/" className={navStyles.brand}>
          <Image
            src="/logo/logo-slogan-horizontal.webp"
            alt="Riendzo — Assistente de Viagens"
            width={100}
            height={42}
            priority
          />
        </Link>

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
              className={`${navStyles.navItem} ${openMenu === section.id ? navStyles.open : ''
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
                {flags[section.id] && <em className={navStyles.soonBadge}>breve</em>}
                <i className={navStyles.chev} />
              </button>

              <div className={navStyles.mega}>
                {section.links.map((link) => {
                  const soon = Boolean(flags[section.id] || flags[link.href]);
                  const inner = (
                    <>
                      <span className={navStyles.megaIcon}>{link.icon}</span>
                      <span className={navStyles.megaText}>
                        <h4>
                          {link.title}
                          {soon && <em className={navStyles.soonBadge}>breve</em>}
                        </h4>
                        <p>{link.desc}</p>
                      </span>
                    </>
                  );
                  return soon ? (
                    <span key={link.title} className={`${navStyles.megaLink} ${navStyles.megaSoon}`} aria-disabled="true" title="Disponível em breve">
                      {inner}
                    </span>
                  ) : (
                    <Link key={link.title} className={navStyles.megaLink} href={link.href}>
                      {inner}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Link href="/pesquisa" aria-label="Pesquisar" className={navStyles.searchBtn}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3" /></svg>
        </Link>

        <Link href="/conta" className={navStyles.aiPill}>
          <span className={navStyles.aiDot} />
          Riendzo AI
        </Link>

        {/* Mobile Humburguer Menu */}
        <button
          className={`${navStyles.burger} ${mobileOpen ? navStyles.active : ''
            }`}
          aria-label="Abrir menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={navStyles.burgerBar} />
        </button>

        {/* Language switcher */}
        <div className={navStyles.languageSwitcher}>
          <button
            type="button"
            className={navStyles.languageButton}
            onClick={() => setLanguageOpen((v) => !v)}
            aria-expanded={languageOpen}
            aria-label="Selecionar idioma"
          >
            <span>{locale.toUpperCase()}</span>
            <i className={navStyles.languageChev} />
          </button>

          {languageOpen && (
            <div className={navStyles.languageMenu}>
              <button
                type="button"
                className={navStyles.languageOption}
                onClick={() => switchLanguage('pt')}
              >
                Português
              </button>

              <button
                type="button"
                className={navStyles.languageOption}
                onClick={() => switchLanguage('en')}
              >
                English
              </button>
              <button
                type="button"
                className={navStyles.languageOption}
                onClick={() => switchLanguage('ts')}
              >
                Xichangana
              </button>
              <button
                type="button"
                className={navStyles.languageOption}
                onClick={() => switchLanguage('se')}
              >
                Cisena
              </button>
              <button
                type="button"
                className={navStyles.languageOption}
                onClick={() => switchLanguage('kh')}
              >
                Emakhuwa
              </button>
            </div>
          )}
        </div>
      </nav>

      {mobileOpen && (
        <div className={navStyles.mobilePanel}>
          {NAV_SECTIONS.map((section) => (
            <div
              key={section.id}
              className={`${navStyles.mItem} ${mobileSection === section.id ? navStyles.open : ''
                }`}
            >
              <button
                className={navStyles.mTrigger}
                onClick={() => toggleMobileSection(section.id)}
              >
                {section.emoji} {section.label}
                {flags[section.id] && <em className={navStyles.soonBadge}>breve</em>}
                <i className={navStyles.mChev} />
              </button>

              <div className={navStyles.mSub}>
                {section.links.map((link) =>
                  flags[section.id] || flags[link.href] ? (
                    <span key={link.title} className={navStyles.mSoon} aria-disabled="true">
                      {link.title} <em className={navStyles.soonBadge}>breve</em>
                    </span>
                  ) : (
                    <Link key={link.title} href={link.href}>
                      {link.title}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          <div className={navStyles.mItem}>
            <Link href="/pesquisa" className={navStyles.mAiLink}>
              🔍 Pesquisar
            </Link>
            <Link href="/conta" className={navStyles.mAiLink}>
              🤖 Riendzo AI
            </Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
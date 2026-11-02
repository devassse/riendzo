import heroStyles from '@/app/css/hero.module.css';
import { getTranslations } from 'next-intl/server';

export default async function RiendzoHero() {
  const t = await getTranslations('Hero');
  return (
    <>
      <section className={heroStyles.hero} id="home">
        <div
          className={heroStyles.heroVideoWrap}
          aria-hidden="true"
        >
          <video
            className={heroStyles.heroVideo}
            poster="/video/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="/video/hero-video.mp4"
              type="video/mp4"
            />
          </video>

          <div className={heroStyles.heroVideoOverlay} />
        </div>

        <div className={heroStyles.heroContent}>
          <h1>
            {t('title')} - {' '}
            <span>
              {t('subtitle')}
            </span>
          </h1>

          <p>
            {t('description')}
          </p>
        </div>


      </section>

      <div className={heroStyles.footnote}>
        <span className={heroStyles.eyebrow}>
          🇲🇿 {t('bottomNote')}
        </span>
        <br />
        <a
          href="#explore"
          className="
          scroll-down
          inline-flex
          items-center
          justify-center
          text-[#00aefb]
          transition-colors
          duration-300
          hover:text-white
          animate-bounce
      "
          aria-label="Scroll down"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-10 w-10"
          >
            <path
              d="m6 6 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m6 12 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
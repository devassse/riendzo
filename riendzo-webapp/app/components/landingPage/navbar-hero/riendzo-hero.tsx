import heroStyles from '@/app/css/hero.module.css';

export default function RiendzoHero() {
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
          História, cultura e serviços —{' '}
          <span>
            tudo o que é moçambicano, num só lugar.
          </span>
        </h1>

        <p>
          O Riendzo combina conteúdo, descoberta, informação
          prática, turismo e inteligência artificial numa única
          experiência digital.
        </p>
      </div>

      
    </section>

    <div className={heroStyles.footnote}>
        <span className={heroStyles.eyebrow}>
          🇲🇿 Plataforma Digital para Descobrir Moçambique
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
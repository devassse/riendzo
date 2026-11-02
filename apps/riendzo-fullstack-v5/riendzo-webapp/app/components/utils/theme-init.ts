/**
 * Runs before the page is painted: uses the visitor's saved choice, or the system setting
 * (prefers-color-scheme) the first time. Put it in <head> as an inline script.
 */
export const THEME_KEY = "riendzo-theme";
export const THEME_INIT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`;

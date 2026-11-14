/**
 * Runs before the page is painted (inline script in <head>):
 *  - applies the visitor's saved choice, or the system setting (prefers-color-scheme) the first time;
 *  - makes every [data-theme-toggle] button work, even if the rest of the site's JavaScript has not loaded yet
 *    (slow phone, or blocked while developing over the local network);
 *  - while the visitor never chose, follows the system when it changes.
 */
export const THEME_KEY = "riendzo-theme";
export const THEME_INIT = `(function(){var K="${THEME_KEY}",d=document.documentElement;function saved(){try{var t=localStorage.getItem(K);return t==="light"||t==="dark"?t:null}catch(e){return null}}
function set(t){d.setAttribute("data-theme",t)}
var mq=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
function system(){return mq&&mq.matches?"dark":"light"}
set(saved()||system());
document.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("[data-theme-toggle]"):null;if(!b)return;var n=d.getAttribute("data-theme")==="dark"?"light":"dark";set(n);try{localStorage.setItem(K,n)}catch(x){}});
if(mq){var f=function(){if(!saved())set(system())};if(mq.addEventListener)mq.addEventListener("change",f);else if(mq.addListener)mq.addListener(f)}})();`;

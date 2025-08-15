// site-common.js
(function () {
    const REMOTE_WIDGET_JS = "https://cdn.jsdelivr.net/gh/Elias-03/custom_ad/promo-widget.js?v=" + Date.now();
    const REMOTE_WIDGET_CSS = "https://raw.githubusercontent.com/Elias-03/custom_ad/refs/heads/main/promo-widget.css?v=" + Date.now();
    const freshJsonUrl = "https://raw.githubusercontent.com/Elias-03/custom_ad/refs/heads/main/promo.json?v=" + Date.now();

    window.__WPLX_WIDGET_CONFIG = window.__WPLX_WIDGET_CONFIG || {
        jsonUrl: freshJsonUrl,
        forceShow: true,
    };

    // Inject CSS via JS
    fetch(REMOTE_WIDGET_CSS)
        .then(res => res.text())
        .then(css => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });

    // Inject JS
    const s = document.createElement("script");
    s.src = REMOTE_WIDGET_JS;
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    (document.head || document.documentElement).appendChild(s);
})();

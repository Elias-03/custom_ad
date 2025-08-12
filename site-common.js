// site-common.js
(function () {
    const REMOTE_WIDGET_JS = "https://cdn.jsdelivr.net/gh/Elias-03/custom_ad/promo-widget.js";
    const freshJsonUrl = "https://raw.githubusercontent.com/Elias-03/custom_ad/main/promo.json?t=" + Date.now();

    window.__WPLX_WIDGET_CONFIG = window.__WPLX_WIDGET_CONFIG || {
        jsonUrl: freshJsonUrl,
    };

    const s = document.createElement("script");
    s.src = REMOTE_WIDGET_JS;
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    (document.head || document.documentElement).appendChild(s);
})();

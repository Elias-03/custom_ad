// promo-widget.js
(function () {
  const cfg = window.__WPLX_WIDGET_CONFIG || {};
  const baseUrl = cfg.baseUrl || ".";
  const jsonUrl = cfg.jsonUrl || `${baseUrl}/promo.json`;
  const containerId = "wplx-promo-widget";
  const styleId = "wplx-promo-style";
  const shownHistoryKey = "wplx_shown_history";
  const sessionClosedKey = "wplx_session_closed";

  function createStyles() {
    if (document.getElementById(styleId)) return;
    const link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = `${baseUrl}/promo-widget.css`;
    document.head.appendChild(link);
  }

  function escapeHtml(s) { if (s == null) return ""; return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[m])); }

  function buildMarkup(promoData, styleData) {
    const { image, url, brand, offer, text, cta, target, supplementary } = promoData;
    const { buttonColor, buttonTextColor, wrapIsClickable } = styleData;

    const brandHtml = brand ? `<div class="wplx-brand">${escapeHtml(brand)}</div>` : "";
    const offerHtml = offer ? `<div class="wplx-offer">${escapeHtml(offer)}</div>` : "";
    const textHtml = text ? `<div class="wplx-text">${escapeHtml(text)}</div>` : "";
    const targetHtml = target ? `<div class="wplx-target">${escapeHtml(target)}</div>` : "";
    const suppHtml = supplementary ? `<div class="wplx-supplementary">${escapeHtml(supplementary)}</div>` : "";
    const btnBg = buttonColor || "#007bff";
    const btnColor = buttonTextColor || "#fff";
    const closeBtn = `<button class="wplx-close" aria-label="close" title="close">✕</button>`;

    let imgHtml = image ? `<div class="wplx-image-wrap"><img src="${escapeHtml(image)}" alt="${escapeHtml(brand || 'promo')}"></div>` : "";
    let ctaHtml = cta ? `<span class="wplx-cta" style="background-color:${escapeHtml(btnBg)};color:${escapeHtml(btnColor)}">${escapeHtml(cta)}</span>` : "";

    if (!wrapIsClickable) {
      if (image) {
        imgHtml = `<div class="wplx-image-wrap"><a href="${escapeHtml(url || '#')}" target="_blank" rel="noopener"><img src="${escapeHtml(image)}" alt="${escapeHtml(brand || 'promo')}"></a></div>`;
      }
      if (cta) {
        ctaHtml = `<a class="wplx-cta" href="${escapeHtml(url || '#')}" target="_blank" rel="noopener" style="background-color:${escapeHtml(btnBg)};color:${escapeHtml(btnColor)}">${escapeHtml(cta)}</a>`;
      }
    }

    const innerContent = `${closeBtn}${imgHtml}<div class="wplx-body">${brandHtml}${offerHtml}${textHtml}${targetHtml}${suppHtml}${ctaHtml}</div>`;

    if (wrapIsClickable) {
      return `<a href="${escapeHtml(url || '#')}" target="_blank" rel="noopener" class="wplx-wrap-link"><div class="wplx-wrap">${innerContent}</div></a>`;
    }
    return `<div class="wplx-wrap">${innerContent}</div>`;
  }

  function render(data) {
    const { promo, style, rules } = data;
    if (!promo || promo.status !== "on") {
      removeWidget();
      return;
    }

    if (isPageExcluded(rules)) return;
    if (!shouldShowAd(rules)) return;

    createStyles(style);
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement("div");
      el.id = containerId;
      document.body.appendChild(el);
      el.addEventListener("click", function (ev) {
        if (ev.target.closest(".wplx-close")) {
          ev.preventDefault();
          el.remove();
          if (rules.showOncePerSession) {
            sessionStorage.setItem(sessionClosedKey, "true");
          }
          const history = JSON.parse(localStorage.getItem(shownHistoryKey) || "[]");
          history.push(Date.now());
          localStorage.setItem(shownHistoryKey, JSON.stringify(history));
        }
      });
    }

    el.className = style.position || "bottom-right";
    if (style.width) el.style.width = style.width;
    el.innerHTML = buildMarkup(promo, style);

    setTimeout(() => el.classList.add("visible"), 50);
  }

  function removeWidget() {
    const e = document.getElementById(containerId);
    if (e) e.remove();
  }

  function isPageExcluded(rules) {
    const href = window.location.href;
    if (rules && rules.excludedPaths && rules.excludedPaths.indexOf(href) !== -1) return true;
    if (rules && rules.excludedPatterns) {
      for (let pattern of rules.excludedPatterns) {
        try {
          if (new RegExp(pattern, "i").test(href)) return true;
        } catch (e) { console.warn("Invalid regex pattern:", pattern); }
      }
    }
    return false;
  }

  function shouldShowAd(rules) {
    if (rules.showOncePerSession && sessionStorage.getItem(sessionClosedKey) === "true") {
      return false;
    }

    if (rules.displayFrequency) {
      const freq = rules.displayFrequency;
      if (freq.minutes && freq.times && freq.times > 0) {
        const history = JSON.parse(localStorage.getItem(shownHistoryKey) || "[]");
        const now = Date.now();
        const cutoff = now - (freq.minutes * 60 * 1000);

        const recentViews = history.filter(t => t > cutoff);
        if (recentViews.length >= freq.times) {
          return false;
        }

        if (recentViews.length > 0) {
          const lastView = recentViews[recentViews.length - 1];
          const interval = (freq.minutes * 60 * 1000) / freq.times;
          if (now < lastView + interval) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function fetchAndRender() {
    fetch(jsonUrl, { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject("Fetch failed"))
      .then(json => {
        if (json && typeof json === "object") {
          render(json);
        }
      })
      .catch(err => console.warn("promo-widget fetch err:", err));
  }

  fetchAndRender();
})();

// promo-widget.js   (host on GitHub raw; name it e.g. promo-widget.js or wplx-widget.js)
(function () {
  // config override (from site-common.js) if present
  const cfg = window.__WPLX_WIDGET_CONFIG || {};
  const jsonUrl = cfg.jsonUrl || "https://raw.githubusercontent.com/YourUser/YourRepo/main/promo.json";
  const pollMs = (Number(cfg.pollIntervalSeconds) || 0) * 1000;
  const containerId = "wplx-promo-widget";   // intentionally not "ad"
  const styleId = "wplx-promo-style";

  function createStyles() {
    if (document.getElementById(styleId)) return;
    const css = `
      #${containerId} { position: fixed; z-index: 999999; width: 320px; max-width: calc(100% - 32px); box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; transition: opacity .22s ease, transform .22s ease; }
      #${containerId}.bottom-right { right: 16px; bottom: 16px; }
      #${containerId}.bottom-left  { left: 16px; bottom: 16px; }
      #${containerId}.top-right    { right: 16px; top: 16px; }
      #${containerId}.top-left     { left: 16px; top: 16px; }
      #${containerId} .wplx-wrap { background: #fff; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); overflow: hidden; border: 1px solid rgba(0,0,0,0.06); position: relative; }
      #${containerId} img { display:block; width:100%; height:auto; object-fit:cover; }
      #${containerId} .wplx-body { padding: 12px; }
      #${containerId} .wplx-brand { font-size:12px; color:#666; margin:0 0 6px; }
      #${containerId} .wplx-offer { font-size:16px; margin:0 0 6px; color:#111; }
      #${containerId} .wplx-text { font-size:14px; color:#333; margin:0 0 8px; }
      #${containerId} .wplx-cta { display:inline-block; padding:8px 12px; border-radius:8px; text-decoration:none; font-weight:600; }
      #${containerId} .wplx-close { position:absolute; top:8px; right:8px; border:0; background:transparent; font-size:16px; cursor:pointer; color:#555; }
      @media (max-width:420px){ #${containerId} { width: 94%; left:3%; right:3%; } }
    `;
    const s = document.createElement("style");
    s.id = styleId;
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function escapeHtml(s) { if (s == null) return ""; return String(s).replace(/[&<>"']/g, function (m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g,'&quot;'); }

  function buildMarkup(data) {
    // only render provided fields; missing fields are skipped (layout remains sane)
    const imgHtml = data.image ? `<a href="${escapeAttr(data.url || '#')}" target="_blank" rel="noopener"><img src="${escapeAttr(data.image)}" alt="${escapeAttr(data.brand || 'promo')}" onerror="this.style.display='none'"></a>` : "";
    const brandHtml = data.brand ? `<div class="wplx-brand">${escapeHtml(data.brand)}</div>` : "";
    const offerHtml = data.offer ? `<div class="wplx-offer">${escapeHtml(data.offer)}</div>` : "";
    const textHtml = data.text ? `<div class="wplx-text">${escapeHtml(data.text)}</div>` : "";
    const targetHtml = data.target ? `<div class="wplx-target" style="font-size:12px;color:#666;margin-top:6px;">${escapeHtml(data.target)}</div>` : "";
    const suppHtml = data.supplementary ? `<div class="wplx-supplementary" style="font-size:12px;color:#999;margin-top:4px;">${escapeHtml(data.supplementary)}</div>` : "";
    const btnBg = data.buttonColor || "#007bff";
    const btnColor = data.buttonTextColor || "#fff";
    const ctaHtml = data.cta ? `<a class="wplx-cta" href="${escapeAttr(data.url || '#')}" target="_blank" rel="noopener" style="background:${escapeAttr(btnBg)};color:${escapeAttr(btnColor)}">${escapeHtml(data.cta)}</a>` : "";
    const closeBtn = `<button class="wplx-close" aria-label="close" title="close">✕</button>`;
    return `<div class="wplx-wrap">${closeBtn}${imgHtml}<div class="wplx-body">${brandHtml}${offerHtml}${textHtml}${targetHtml}${suppHtml}${ctaHtml}</div></div>`;
  }

  function render(data) {
    if (!data || typeof data !== "object") return;
    // status check
    if ((String(data.status || "").toLowerCase()) !== "on") {
      // remove if present
      const e = document.getElementById(containerId); if (e) e.remove(); return;
    }
    createStyles();
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement("div");
      el.id = containerId;
      document.body.appendChild(el);
      // close button handler (delegated)
      el.addEventListener("click", function (ev) {
        if (ev.target.closest(".wplx-close")) {
          el.remove();
        }
      });
    }
    // position: priority order -> window config -> data -> default
    const pos = (window.__WPLX_WIDGET_CONFIG && window.__WPLX_WIDGET_CONFIG.position) || data.position || "bottom-right";
    el.className = pos;
    // width override if provided
    if (data.width) el.style.width = data.width;
    el.innerHTML = buildMarkup(data);
  }

  function removeWidget() { const e = document.getElementById(containerId); if (e) e.remove(); }

  function fetchAndRender() {
    fetch(jsonUrl, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("fetch failed "+r.status); return r.json(); })
      .then(function (json) { render(json); })
      .catch(function (err) { /* silent fail — do not break host site */ console.warn("promo-widget fetch err:", err); });
  }

  // load once, then optionally poll for changes
  fetchAndRender();
  if (pollMs > 0) {
    setInterval(fetchAndRender, pollMs);
  }
})();

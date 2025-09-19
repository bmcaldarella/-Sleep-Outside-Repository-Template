export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click (robusto)
export function setClick(selector, callback) {
  const el = qs(selector);
  if (!el) return;
  el.addEventListener(
    "touchend",
    (event) => {
      event.preventDefault();
      callback(event);
    },
    { passive: false }
  );
  el.addEventListener("click", callback);
}

// ---- templating helpers ----
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (!parentElement) throw new Error("Parent element is required");
  if (clear) parentElement.textContent = "";
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) throw new Error("Parent element is required");
  parentElement.innerHTML = template;
  if (typeof callback === "function") callback(data);
}

export async function loadTemplate(relativePathFromThisModule) {
  try {
    const url = new URL(relativePathFromThisModule, import.meta.url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } catch (err) {
    console.error("loadTemplate error for", relativePathFromThisModule, err);
    throw err;
  }
}

export async function loadHeaderFooter({ afterHeaderRender, afterFooterRender } = {}) {
  const headerEl = document.getElementById("main-header");
  const footerEl = document.getElementById("main-footer");

  if (headerEl) {
    try {
      const headerHtml = await loadTemplate("../partials/header.html");
      renderWithTemplate(headerHtml, headerEl, null, afterHeaderRender);
    } catch (e) {
      console.error("No se pudo cargar header.html", e);
    }
  } else {
    console.warn("Falta #main-header en esta página.");
  }

  if (footerEl) {
    try {
      const footerHtml = await loadTemplate("../partials/footer.html");
      renderWithTemplate(footerHtml, footerEl, null, () => {
        const y = footerEl.querySelector("#year");
        if (y) y.textContent = new Date().getFullYear();
        if (typeof afterFooterRender === "function") afterFooterRender();
      });
    } catch (e) {
      console.error("No se pudo cargar footer.html", e);
    }
  } else {
    console.warn("Falta #main-footer en esta página.");
  }
}

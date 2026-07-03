// Lightweight "click to upload" image placeholders.
// Each element with class "img-upload" becomes a clickable box that lets you
// choose a local image file. The chosen image is stored in the browser's
// localStorage (per data-key) so it persists across page reloads on the
// same device/browser. Nothing is uploaded anywhere — it all stays local.

(function () {
  var STORAGE_PREFIX = "mvp-tac-img:";

  function storageKey(key) {
    return STORAGE_PREFIX + key;
  }

  function buildPlaceholder(el) {
    var alt = el.getAttribute("data-alt") || "Image";

    var content = document.createElement("div");
    content.className = "img-upload-placeholder-content";

    var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "img-upload-icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "1.5");
    icon.innerHTML =
      '<path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke-linecap="round" stroke-linejoin="round"/>';

    var text = document.createElement("div");
    text.className = "img-upload-text";
    text.textContent = "Click to upload image";

    var subtext = document.createElement("div");
    subtext.className = "img-upload-subtext";
    subtext.textContent = alt;

    content.appendChild(icon);
    content.appendChild(text);
    content.appendChild(subtext);

    var img = document.createElement("img");
    img.className = "img-upload-preview";
    img.alt = alt;

    var replaceBadge = document.createElement("div");
    replaceBadge.className = "img-upload-replace";
    replaceBadge.textContent = "Replace image";

    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    el.appendChild(content);
    el.appendChild(img);
    el.appendChild(replaceBadge);
    el.appendChild(input);

    return { img: img, input: input };
  }

  function loadSaved(el, key, img) {
    var saved = null;
    try {
      saved = localStorage.getItem(storageKey(key));
    } catch (e) {
      // localStorage unavailable (e.g. privacy mode) — just show the placeholder.
    }
    if (saved) {
      img.src = saved;
      el.classList.add("has-image");
    }
  }

  function handleFile(el, key, img, file) {
    if (!file || file.type.indexOf("image/") !== 0) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var dataUrl = e.target.result;
      img.src = dataUrl;
      el.classList.add("has-image");
      try {
        localStorage.setItem(storageKey(key), dataUrl);
      } catch (err) {
        // Storage full or unavailable — the image still displays for this session.
      }
    };
    reader.readAsDataURL(file);
  }

  function init() {
    var placeholders = document.querySelectorAll(".img-upload");
    placeholders.forEach(function (el) {
      var key = el.getAttribute("data-key") || "image";
      var refs = buildPlaceholder(el);

      loadSaved(el, key, refs.img);

      el.addEventListener("click", function () {
        refs.input.click();
      });

      refs.input.addEventListener("click", function (e) {
        e.stopPropagation();
      });

      refs.input.addEventListener("change", function () {
        var file = refs.input.files && refs.input.files[0];
        handleFile(el, key, refs.img, file);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

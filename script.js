const API_KEY = "AIzaSyDZYWh4w2-w4KOxRfE21pNZDN2TuCaHiWM";
const FOLDER_IDS = {
  illustration: "1D51mD5492H05RYBnvllBblCbHSU_kIa3",
  animation: "1jdMVLFM1fEJin_DGsxU5h5QBT7TffOQV",
  design: "1F9qYQ_aFXLjImo61XxMW1uXwZWmSWQ3u",
  randomPractice: "16O1UHav8jttMlLGwXOft5l-iUt4w0uTt",
  storyboard: "12QtYLnwsjHcE1BOiGWCBTA4qDlA7c4zQ",
  traditionalWork: "12TuHnmo3-P_u7pgsdJwuqw1eEPGUypaP",
  wallPaint: "12R59OQfIDhmGAfRCp5hhICW28zJzU15n",
  timelapse: "12RaSwvp7TjWUhhbkBz6jskHwI1qKxFgZ"
};

// Mapping folder IDs to gallery elements
const galleryElements = Object.fromEntries(
  Object.keys(FOLDER_IDS).map(key => [
    key,
    document.getElementById(`${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-gallery`)
  ])
);

// Utility functions to handle elements creation
function createImageElement(file) {
  const { id, name } = file;
  const element = document.createElement("img");
  element.dataset.src = `https://lh3.googleusercontent.com/d/${id}=s1000`;
  element.alt = name;
  element.loading = "lazy";
  element.classList.add("lazy-media");
  element.addEventListener("click", () => enableModal(element.src));
  return element;
}

function createVideoElement(file, folderKey) {
  const { id, mimeType } = file;
  const driveLink = `https://drive.google.com/uc?id=${id}`;
  const previewLink = `https://drive.google.com/file/d/${id}/preview`;

  let element;
  if (["animation", "timelapse"].includes(folderKey)) {
    element = document.createElement("iframe");
    element.dataset.src = previewLink;
    element.width = "600";
    element.height = "300";
    element.allowFullscreen = true;
  } else {
    element = document.createElement("video");
    element.dataset.src = driveLink;
    element.controls = true;
    element.width = 160;
    element.height = 160;
  }
  element.classList.add("lazy-media");
  return element;
}

function createPdfElement(file, folderKey) {
  const { id, name } = file;
  const driveLink = `https://drive.google.com/uc?id=${id}`;
  const previewLink = `https://drive.google.com/file/d/${id}/preview`;

  let element;
  if (folderKey === "storyboard") {
    element = document.createElement("iframe");
    element.dataset.src = previewLink;
    element.width = "600";
    element.height = "300";
    element.classList.add("lazy-media");
  } else {
    element = document.createElement("a");
    element.href = driveLink;
    element.target = "_blank";
    element.textContent = `📄 ${name}`;
    element.style.display = "block";
    element.style.margin = "5px 0";
  }
  return element;
}

// General function to create an element based on file type
function createElement(file, folderKey) {
  const { mimeType } = file;
  if (mimeType.startsWith("image/")) return createImageElement(file);
  if (mimeType.startsWith("video/")) return createVideoElement(file, folderKey);
  if (mimeType === "application/pdf") return createPdfElement(file, folderKey);
}

// Function to render a file into the gallery container
function renderFile(file, folderKey, container) {
  const element = createElement(file, folderKey);
  if (element) {
    element.classList.add("animate-on-scroll");
    container.appendChild(element);
    lazyObserver.observe(element);
    scrollObserver.observe(element);
  }
}

// Load media from Google Drive folder
async function loadMedia(folderId, galleryElement, folderKey) {
  const api = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;

  try {
    const files = (await (await fetch(api)).json()).files;
    galleryElement.innerHTML = files.length ? "" : "<p>No media found in this folder.</p>";
    files.forEach(file => renderFile(file, folderKey, galleryElement));
  } catch (err) {
    galleryElement.innerHTML = "<p>Failed to load media.</p>";
    console.error(`${folderKey} Error:`, err);
  }
}

// Load storyboard media with subfolders
async function loadStoryboardMedia(parentFolderId, galleryElement) {
  const folderApi = `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)&pageSize=1000`;

  try {
    const subfolders = (await (await fetch(folderApi)).json()).files;
    galleryElement.innerHTML = subfolders.length ? "" : "<p>No subfolders found.</p>";

    for (const sub of subfolders) {
      const subApi = `https://www.googleapis.com/drive/v3/files?q='${sub.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;
      const files = (await (await fetch(subApi)).json()).files;
      if (!files.length) continue;

      const title = document.createElement("h3");
      title.textContent = sub.name;
      title.style.color = "#fff";
      title.style.marginTop = "20px";
      galleryElement.appendChild(title);

      files.forEach(file => renderFile(file, "storyboard", galleryElement));
    }
  } catch (err) {
    galleryElement.innerHTML = "<p>Failed to load storyboard media.</p>";
    console.error("Storyboard Error:", err);
  }
}

// Lazy load observer
const lazyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const src = el.dataset.src;
      if (src) {
        if (el.tagName === "IFRAME" || el.tagName === "IMG" || el.tagName === "VIDEO") {
          el.src = src;
          el.removeAttribute("data-src");
        }
      }
      lazyObserver.unobserve(el);
    }
  });
}, { rootMargin: "100px" });

// Scroll animation observer
const scrollObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle("animated", entry.isIntersecting);
  });
}, { threshold: 0.1 });

function setupScrollAnimations() {
  document.querySelectorAll(".section-box").forEach(el => scrollObserver.observe(el));
}

// Main entry point when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  document.querySelector(".close").onclick = () => (modal.style.display = "none");
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };

  Object.entries(FOLDER_IDS).forEach(([key, id]) => {
    const el = galleryElements[key];
    if (!el) return;

    if (key === "storyboard") {
      loadStoryboardMedia(id, el);
    } else {
      loadMedia(id, el, key);
    }

    if (["storyboard", "animation", "timelapse"].includes(key)) {
      el.classList.add("single-row");
    }
  });

  setupScrollAnimations();
});

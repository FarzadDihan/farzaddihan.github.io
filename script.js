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

const galleryElements = Object.fromEntries(
  Object.keys(FOLDER_IDS).map(key => [key, document.getElementById(`${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-gallery`)])
);

function enableModal(imgSrc) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-img").src = imgSrc;
  modal.style.display = "block";
}

function renderFile(file, folderKey, container) {
  const { id, name, mimeType } = file;
  const driveLink = `https://drive.google.com/uc?id=${id}`;
  const previewLink = `https://drive.google.com/file/d/${id}/preview`;

  let element;

  if (mimeType.startsWith("image/")) {
    element = document.createElement("img");
    element.src = `https://lh3.googleusercontent.com/d/${id}=s1000`;
    element.alt = name;
    element.addEventListener("click", () => enableModal(element.src));
  } else if (mimeType.startsWith("video/")) {
    element =
      ["animation", "timelapse"].includes(folderKey)
        ? Object.assign(document.createElement("iframe"), {
            src: previewLink,
            width: "600",
            height: "300",
            allowFullscreen: true,
            style: "margin: 5px 0;"
          })
        : Object.assign(document.createElement("video"), {
            src: driveLink,
            controls: true,
            width: 160,
            height: 160
          });
  } else if (mimeType === "application/pdf") {
    if (folderKey === "storyboard") {
      element = document.createElement("iframe");
      element.src = previewLink;
      element.width = "600";
      element.height = "300";
      element.style.margin = "5px 0";
    } else {
      element = document.createElement("a");
      element.href = driveLink;
      element.target = "_blank";
      element.textContent = `📄 ${name}`;
      element.style.display = "block";
      element.style.margin = "5px 0";
    }
  }

  if (element) {
    element.classList.add("animate-on-scroll");
    container.appendChild(element);
    observer.observe(element);
  }
}

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

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
      } else {
        entry.target.classList.remove("animated");
      }
    });
  },
  { threshold: 0.1 }
);

function setupScrollAnimations() {
  document.querySelectorAll(".section-box").forEach(el => observer.observe(el));
}

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

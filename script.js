
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

const galleryElements = {
  illustration: document.getElementById("illustration-gallery"),
  animation: document.getElementById("animation-gallery"),
  design: document.getElementById("design-gallery"),
  randomPractice: document.getElementById("random-practice-gallery"),
  storyboard: document.getElementById("storyboard-gallery"),
  traditionalWork: document.getElementById("traditional-work-gallery"),
  wallPaint: document.getElementById("wall-paint-gallery"),
  timelapse: document.getElementById("timelapse-gallery")
};

// Load storyboard from subfolders
async function loadStoryboardMedia(parentFolderId, galleryElement) {
  const folderApi = `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)&pageSize=1000`;

  try {
    const folderRes = await fetch(folderApi);
    const subfolders = (await folderRes.json()).files;

    if (!subfolders.length) {
      galleryElement.innerHTML = "<p>No subfolders found.</p>";
      return;
    }

    galleryElement.innerHTML = "";

    for (const subfolder of subfolders) {
      const filesApi = `https://www.googleapis.com/drive/v3/files?q='${subfolder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;
      const files = (await (await fetch(filesApi)).json()).files;

      if (files.length) {
        const folderTitle = document.createElement("h3");
        folderTitle.textContent = subfolder.name;
        folderTitle.style.color = "#fff";
        folderTitle.style.marginTop = "20px";
        galleryElement.appendChild(folderTitle);

        files.forEach(file => {
          const mimeType = file.mimeType;
          const fileId = file.id;

          if (mimeType.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = `https://lh3.googleusercontent.com/d/${fileId}=s1000`;
            img.alt = file.name;
            img.addEventListener("click", () => {
              document.getElementById("modal-img").src = img.src;
              document.getElementById("modal").style.display = "block";
            });
            galleryElement.appendChild(img);
          } else if (mimeType === "application/pdf") {
            const iframe = document.createElement("iframe");
            iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
            iframe.width = "600";
            iframe.height = "300";
            iframe.style.margin = "5px 0";
            galleryElement.appendChild(iframe);
          }
        });
      }
    }
  } catch (err) {
    galleryElement.innerHTML = "<p>Failed to load storyboard media.</p>";
    console.error("Storyboard Error:", err);
  }
}

// Load regular folder media
async function loadMedia(folderId, galleryElement, folderKey) {
  const mediaApi = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;

  try {
    const files = (await (await fetch(mediaApi)).json()).files;

    if (!files.length) {
      galleryElement.innerHTML = "<p>No media found in this folder.</p>";
      return;
    }

    galleryElement.innerHTML = "";

    files.forEach(file => {
      const fileId = file.id;
      const mimeType = file.mimeType;
      const driveLink = `https://drive.google.com/uc?id=${fileId}`;

      if (mimeType.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = `https://lh3.googleusercontent.com/d/${fileId}=s1000`;
        img.alt = file.name;
        img.addEventListener("click", () => {
          document.getElementById("modal-img").src = img.src;
          document.getElementById("modal").style.display = "block";
        });
        galleryElement.appendChild(img);
      } else if (mimeType.startsWith("video/")) {
        if (folderKey === "animation" || folderKey === "timelapse") {
          const iframe = document.createElement("iframe");
          iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
          iframe.width = "600";
          iframe.height = "300";
          iframe.allowFullscreen = true;
          iframe.style.margin = "5px 0";
          galleryElement.appendChild(iframe);
        } else {
          const video = document.createElement("video");
          video.src = driveLink;
          video.controls = true;
          video.width = 160;
          video.height = 160;
          galleryElement.appendChild(video);
        }
      } else if (mimeType === "application/pdf") {
        const link = document.createElement("a");
        link.href = driveLink;
        link.target = "_blank";
        link.textContent = `📄 ${file.name}`;
        link.style.display = "block";
        link.style.margin = "5px 0";
        galleryElement.appendChild(link);
      }
    });
  } catch (err) {
    galleryElement.innerHTML = "<p>Failed to load media.</p>";
    console.error("Error loading media:", err);
  }
}

// Init galleries after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  Object.entries(FOLDER_IDS).forEach(([key, id]) => {
    if (key === "storyboard") {
      loadStoryboardMedia(id, galleryElements[key]);
    } else {
      loadMedia(id, galleryElements[key], key);
    }

    if (["storyboard", "animation", "timelapse"].includes(key)) {
      galleryElements[key].classList.add("single-row");
    }
  });
});

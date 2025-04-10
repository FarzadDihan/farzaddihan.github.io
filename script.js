const API_KEY = "AIzaSyDZYWh4w2-w4KOxRfE21pNZDN2TuCaHiWM";
const FOLDER_IDS = {
  illustration: "1--p2NcHSTpiPVQqub7QPm2xP9zZkLm-T",
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

async function loadMedia(folderId, galleryElement) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const files = data.files;

    if (files.length === 0) {
      galleryElement.innerHTML = "<p>No media found in this folder.</p>";
      return;
    }

    galleryElement.innerHTML = "";

    files.forEach(file => {
      const fileUrl = `https://drive.google.com/uc?id=${file.id}`;
      const mimeType = file.mimeType;

      if (mimeType.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = `https://lh3.googleusercontent.com/d/${file.id}=s1000`;
        img.alt = file.name;
        img.addEventListener("click", () => {
          document.getElementById("modal-img").src = img.src;
          document.getElementById("modal").style.display = "block";
        });
        galleryElement.appendChild(img);
      } else if (mimeType.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = fileUrl;
        video.controls = true;
        video.width = 160;
        video.height = 160;
        galleryElement.appendChild(video);
      } else if (mimeType === "application/pdf") {
        const pdfLink = document.createElement("a");
        pdfLink.href = fileUrl;
        pdfLink.target = "_blank";
        pdfLink.textContent = file.name;
        galleryElement.appendChild(pdfLink);
      }
    });
  } catch (error) {
    galleryElement.innerHTML = "<p>Failed to load media.</p>";
    console.error("Error loading media:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");

  closeBtn.onclick = () => modal.style.display = "none";

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  loadMedia(FOLDER_IDS.illustration, galleryElements.illustration);
  loadMedia(FOLDER_IDS.animation, galleryElements.animation);
  loadMedia(FOLDER_IDS.design, galleryElements.design);
  loadMedia(FOLDER_IDS.randomPractice, galleryElements.randomPractice);
  loadMedia(FOLDER_IDS.storyboard, galleryElements.storyboard);
  loadMedia(FOLDER_IDS.traditionalWork, galleryElements.traditionalWork);
  loadMedia(FOLDER_IDS.wallPaint, galleryElements.wallPaint);
  loadMedia(FOLDER_IDS.timelapse, galleryElements.timelapse);
});

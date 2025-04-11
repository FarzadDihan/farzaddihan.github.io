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

// Load storyboard from subfolders, including images and PDFs
async function loadStoryboardMedia(parentFolderId, galleryElement) {
  const folderUrl = `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)&pageSize=1000`;

  try {
    const folderRes = await fetch(folderUrl);
    const folderData = await folderRes.json();
    const subfolders = folderData.files;

    if (subfolders.length === 0) {
      galleryElement.innerHTML = "<p>No subfolders found.</p>";
      return;
    }

    galleryElement.innerHTML = "";

    for (const subfolder of subfolders) {
      const fileUrl = `https://www.googleapis.com/drive/v3/files?q='${subfolder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)&pageSize=1000`;
      const fileRes = await fetch(fileUrl);
      const fileData = await fileRes.json();
      const files = fileData.files;

      if (files.length > 0) {
        const folderTitle = document.createElement("h3");
        folderTitle.textContent = subfolder.name;
        folderTitle.style.color = "#fff";
        folderTitle.style.marginTop = "20px";
        galleryElement.appendChild(folderTitle);

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
          } else if (mimeType === "application/pdf") {
            const pdfViewer = document.createElement("iframe");
            pdfViewer.src = `https://drive.google.com/file/d/${file.id}/preview`;
            pdfViewer.width = "600";
            pdfViewer.height = "300";
            pdfViewer.style.margin = "5px 0";
            galleryElement.appendChild(pdfViewer);
          }
        });
      }
    }
  } catch (err) {
    galleryElement.innerHTML = "<p>Failed to load storyboard media.</p>";
    console.error("Storyboard Error:", err);
  }
}

// Load media from main folders (for all except storyboard)
async function loadMedia(folderId, galleryElement, folderKey) {
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
        if (folderKey === "animation") {
          // Use iframe for animation folder videos
          const videoFrame = document.createElement("iframe");
          videoFrame.src = `https://drive.google.com/file/d/${file.id}/preview`;
          videoFrame.width = "600";
          videoFrame.height = "300";
          videoFrame.allowFullscreen = true;
          videoFrame.style.margin = "5px 0";
          galleryElement.appendChild(videoFrame);
        } else {
          // Regular video tag for other folders
          const video = document.createElement("video");
          video.src = fileUrl;
          video.controls = true;
          video.width = 160;
          video.height = 160;
          galleryElement.appendChild(video);
        }

      } else if (mimeType === "application/pdf") {
        const pdfLink = document.createElement("a");
        pdfLink.href = fileUrl;
        pdfLink.target = "_blank";
        pdfLink.textContent = `📄 ${file.name}`;
        pdfLink.style.display = "block";
        pdfLink.style.margin = "5px 0";
        galleryElement.appendChild(pdfLink);
      }
    });
  } catch (error) {
    galleryElement.innerHTML = "<p>Failed to load media.</p>";
    console.error("Error loading media:", error);
  }
}

// Initialize galleries when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");

  closeBtn.onclick = () => modal.style.display = "none";
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };

  Object.keys(FOLDER_IDS).forEach(key => {
    if (key === "storyboard") {
      loadStoryboardMedia(FOLDER_IDS[key], galleryElements[key]);
    } else {
      loadMedia(FOLDER_IDS[key], galleryElements[key], key);
    }
  });
});

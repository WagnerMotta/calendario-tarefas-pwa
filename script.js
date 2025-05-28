let itemCount = 0;
const checklist = document.getElementById('checklist');

function addItem(data = null) {
  itemCount++;
  const item = document.createElement('div');
  item.className = 'check-item';
  item.dataset.id = itemCount;

  let photos = '';
  for (let j = 1; j <= 2; j++) {
    photos += `
      <div class="photo-block">
        <label>Foto ${j}</label>
        <input type="file" accept="image/*" id="foto${itemCount}_${j}">
        <img id="preview${itemCount}_${j}" alt="preview${itemCount}_${j}">
        <label>Observação da Foto ${j}:</label>
        <textarea id="obs${itemCount}_${j}" placeholder="Observações da foto..."></textarea>
      </div>
    `;
  }

  item.innerHTML = `
    <h3>Item ${itemCount} <button onclick="removeItem(${itemCount})" style="float:right;">❌</button></h3>
    <div class="photo-group">${photos}</div>
    <label>Comentário Geral:</label>
    <textarea id="comentario${itemCount}" placeholder="Observações..."></textarea>
  `;
  checklist.appendChild(item);

  for (let j = 1; j <= 2; j++) {
    const inputId = `foto${itemCount}_${j}`;
    const previewId = `preview${itemCount}_${j}`;
    const fileInput = item.querySelector(`#${inputId}`);
    const previewImg = item.querySelector(`#${previewId}`);

    fileInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImg.src = e.target.result;
          previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  item.querySelector(`#comentario${itemCount}`).addEventListener('input', updateProgress);

  if (data) {
    for (let j = 1; j <= 2; j++) {
      const img = item.querySelector(`#preview${itemCount}_${j}`);
      if (data[`foto${itemCount}_${j}`]) {
        img.src = data[`foto${itemCount}_${j}`];
        img.style.display = 'block';
      }
      item.querySelector(`#obs${itemCount}_${j}`).value = data[`obs${itemCount}_${j}`] || '';
    }
    item.querySelector(`#comentario${itemCount}`).value = data[`comentario${itemCount}`] || '';
  }

  updateProgress();
}

function removeItem(id) {
  document.querySelector(`[data-id='${id}']`)?.remove();
  updateProgress();
}

function updateProgress() {
  const total = document.querySelectorAll('.check-item').length;
  const filled = Array.from(document.querySelectorAll('textarea')).filter(t => t.value.trim() !== '').length;
  const percent = total ? (filled / total) * 100 : 0;
  document.getElementById('progressBar').style.width = percent + '%';
}

function saveData() {
  const data = {
    tecnico: document.getElementById('tecnico').value,
    matricula: document.getElementById('matricula').value,
    data: document.getElementById('data').value,
    items: [],
    signature: canvas.toDataURL()
  };
  document.querySelectorAll('.check-item').forEach(item => {
    const id = item.dataset.id;
    const itemData = {};
    for (let j = 1; j <= 2; j++) {
      const img = item.querySelector(`#preview${id}_${j}`);
      itemData[`foto${id}_${j}`] = img.src || '';
      itemData[`obs${id}_${j}`] = item.querySelector(`#obs${id}_${j}`).value;
    }
    itemData[`comentario${id}`] = item.querySelector(`#comentario${id}`).value;
    data.items.push(itemData);
  });
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'checklist.json';
  a.click();
}

function loadData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      document.getElementById('tecnico').value = data.tecnico || '';
      document.getElementById('matricula').value = data.matricula || '';
      document.getElementById('data').value = data.data || '';
      checklist.innerHTML = '';
      itemCount = 0;
      data.items.forEach(itemData => addItem(itemData));
      if (data.signature) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = data.signature;
      }
    };
    reader.readAsText(e.target.files[0]);
  };
  input.click();
}

function share() {
  const text = `Checklist de Manutenção - Técnico: ${document.getElementById('tecnico').value}, Matrícula: ${document.getElementById('matricula').value}, Data: ${document.getElementById('data').value}.`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function exportPDF() {
  const tecnico = document.getElementById("tecnico").value;
  const data = document.getElementById("data").value;
  if (!tecnico || !data) {
    alert("Preencha o nome do técnico e a data.");
    return;
  }
  const element = document.querySelector('.container');
  const opt = {
    margin: 0.3,
    filename: `Checklist_${tecnico}_${data}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save();
}

// Canvas assinatura
const canvas = document.getElementById('signature');
const ctx = canvas.getContext('2d');
let drawing = false;
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!drawing) return;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 2, 0, Math.PI * 2);
  ctx.fill();
}
function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Zoom imagem
document.addEventListener('click', function (e) {
  if (e.target.tagName === 'IMG' && e.target.id.startsWith('preview')) {
    const zoomOverlay = document.getElementById('zoomOverlay');
    const zoomImage = document.getElementById('zoomImage');
    zoomImage.src = e.target.src;
    zoomOverlay.style.display = 'flex';
  }
});
function closeZoom() {
  document.getElementById('zoomOverlay').style.display = 'none';
}

// Tema
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
window.onload = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
};

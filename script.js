let itemCount = 0;

function addItem(data = null) {
  itemCount++;
  const checklist = document.getElementById('checklist');

  const div = document.createElement('div');
  div.className = 'check-item';
  div.dataset.id = itemCount;
  div.dataset.status = data?.status || 'completo';

  div.innerHTML = `
    <div class="item-header">
      <input type="text" class="item-title" placeholder="Título do item" value="${data?.title || ''}" />
      <div class="item-buttons">
        <button class="status-btn ${div.dataset.status === 'completo' ? 'status-completo' : div.dataset.status === 'pendente' ? 'status-pendente' : 'status-em-andamento'}" 
                onclick="toggleStatus(${itemCount}, this)" 
                title="Alterar status do item">
          ${statusText(div.dataset.status)}
        </button>
        <button class="remove-btn" onclick="removeItem(${itemCount})" title="Remover item">×</button>
      </div>
    </div>
    <textarea placeholder="Comentário" class="comment">${data?.comment || ''}</textarea>
    <div class="photo-group">
      <div class="photo-block">
        <input type="file" accept="image/*" onchange="loadPhoto(event, ${itemCount}, 'preview')" title="Adicionar foto de preview" />
        <img src="${data?.preview || ''}" alt="Preview" onclick="zoomImage(this)" />
        <textarea placeholder="Observação foto preview" class="photo-note">${data?.previewNote || ''}</textarea>
      </div>
      <div class="photo-block">
        <input type="file" accept="image/*" onchange="loadPhoto(event, ${itemCount}, 'obs')" title="Adicionar foto de observação" />
        <img src="${data?.obs || ''}" alt="Observação" onclick="zoomImage(this)" />
        <textarea placeholder="Observação foto" class="photo-note">${data?.obsNote || ''}</textarea>
      </div>
    </div>
  `;
  checklist.appendChild(div);
  updateProgress();
}

function statusText(status) {
  switch(status) {
    case 'completo': return '✔️ Concluído';
    case 'pendente': return '❌ Pendência';
    case 'em-andamento': return '⏳ Em andamento';
    default: return '❓ Status';
  }
}

function toggleStatus(id, btn) {
  const item = document.querySelector(`.check-item[data-id="${id}"]`);
  const current = btn.classList.contains('status-completo') ? 'completo' :
                  btn.classList.contains('status-pendente') ? 'pendente' :
                  'em-andamento';
  let next = 'completo';
  if(current === 'completo') next = 'pendente';
  else if(current === 'pendente') next = 'em-andamento';
  else if(current === 'em-andamento') next = 'completo';

  btn.textContent = statusText(next);
  btn.className = 'status-btn ' + (next === 'completo' ? 'status-completo' : next === 'pendente' ? 'status-pendente' : 'status-em-andamento');
  if(item) {
    item.dataset.status = next;
  }
  updateProgress();
}

function removeItem(id) {
  if(confirm('Tem certeza que deseja remover este item?')) {
    const item = document.querySelector(`.check-item[data-id="${id}"]`);
    if(item) {
      item.remove();
      updateProgress();
    }
  }
}

function updateProgress() {
  const checklist = document.getElementById('checklist');
  const items = checklist.querySelectorAll('.check-item');
  if(items.length === 0) {
    document.getElementById('progressBar').style.width = '0%';
    return;
  }
  const completed = Array.from(items).filter(i => i.dataset.status === 'completo').length;
  const percent = Math.round((completed / items.length) * 100);
  document.getElementById('progressBar').style.width = percent + '%';
}

function loadPhoto(event, id, type) {
  const input = event.target;
  const file = input.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const item = document.querySelector(`.check-item[data-id="${id}"]`);
    if(!item) return;
    const img = item.querySelector(`img[alt="${type === 'preview' ? 'Preview' : 'Observação'}"]`);
    if(img) {
      img.src = e.target.result;
      img.style.display = 'block';
    }
  }
  reader.readAsDataURL(file);
}

function zoomImage(img) {
  const overlay = document.getElementById('zoomOverlay');
  const zoomImg = document.getElementById('zoomImage');
  zoomImg.src = img.src;
  overlay.style.display = 'flex';
}

function closeZoom() {
  document.getElementById('zoomOverlay').style.display = 'none';
}

// Assinatura no canvas
const canvas = document.getElementById('signature');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', draw);

function draw(event) {
  if(!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'black';

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Salvar dados no localStorage
function saveData() {
  const data = {
    tecnico: document.getElementById('tecnico').value,
    matricula: document.getElementById('matricula').value,
    data: document.getElementById('data').value,
    items: [],
    assinatura: canvas.toDataURL()
  };

  document.querySelectorAll('.check-item').forEach(item => {
    const id = item.dataset.id;
    const title = item.querySelector('.item-title').value;
    const comment = item.querySelector('.comment').value;
    const status = item.dataset.status;
    const preview = item.querySelector('img[alt="Preview"]').src || '';
    const obs = item.querySelector('img[alt="Observação"]').src || '';
    const previewNote = item.querySelectorAll('textarea.photo-note')[0]?.value || '';
    const obsNote = item.querySelectorAll('textarea.photo-note')[1]?.value || '';

    if(!title.trim() && !comment.trim() && !preview && !obs) return; // Ignorar vazio total

    data.items.push({id, title, comment, status, preview, previewNote, obs, obsNote});
  });

  localStorage.setItem('checklistData', JSON.stringify(data));
  alert('Backup salvo com sucesso!');
}

// Carregar dados do localStorage
function loadData() {
  const data = localStorage.getItem('checklistData');
  if(!data) {
    alert('Nenhum backup encontrado.');
    return;
  }
  const obj = JSON.parse(data);

  document.getElementById('tecnico').value = obj.tecnico || '';
  document.getElementById('matricula').value = obj.matricula || '';
  document.getElementById('data').value = obj.data || '';
  clearChecklist();
  if(obj.items && obj.items.length) {
    obj.items.forEach(item => addItem(item));
  }
  if(obj.assinatura) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = obj.assinatura;
  } else {
    clearSignature();
  }
  updateProgress();
}

function clearChecklist() {
  document.getElementById('checklist').innerHTML = '';
  itemCount = 0;
}

// Exportar checklist em PDF
function exportPDF() {
  // Gera o PDF a partir do container principal
  const element = document.querySelector('.container');
  const opt = {
    margin:       0.5,
    filename:     'checklist.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// Alternar tema claro/escuro
function toggleTheme() {
  const body = document.body;
  if(body.dataset.theme === 'light') {
    body.dataset.theme = 'dark';
  } else {
    body.dataset.theme = 'light';
  }
}

// Função placeholder para compartilhar
function share() {
  alert('Função de compartilhamento ainda não implementada.');
}

// Inicialização - adicionar um item padrão
addItem();

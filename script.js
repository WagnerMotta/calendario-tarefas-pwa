const calendarBody = document.getElementById('calendarBody');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const description = document.getElementById('taskDescription').value;
  const recurring = document.getElementById('taskRecurring').value;

  if (!date || !time || !description) {
    alert('Preencha todos os campos.');
    return;
  }

  tasks.push({ id: Date.now(), date, time, description, recurring });
  saveTasks();
  renderCalendar(currentYear, currentMonth);
  clearForm();
}

function clearForm() {
  document.getElementById('taskDate').value = '';
  document.getElementById('taskTime').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('taskRecurring').value = 'none';
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderCalendar(currentYear, currentMonth);
  renderTaskManager();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    const newDate = prompt('Data (AAAA-MM-DD):', task.date);
    const newTime = prompt('Hora (HH:MM):', task.time);
    const newDesc = prompt('Descrição:', task.description);
    const newRec = prompt('Recorrência (none, daily, weekly, monthly):', task.recurring);

    if (newDate && newTime && newDesc) {
      task.date = newDate;
      task.time = newTime;
      task.description = newDesc;
      task.recurring = newRec || 'none';
      saveTasks();
      renderCalendar(currentYear, currentMonth);
      renderTaskManager();
    }
  }
}

function matchesRecurring(task, dateStr) {
  if (task.date === dateStr) return true;
  const taskDate = new Date(task.date);
  const checkDate = new Date(dateStr);
  if (task.recurring === 'daily') return taskDate <= checkDate;
  if (task.recurring === 'weekly') return taskDate <= checkDate && taskDate.getDay() === checkDate.getDay();
  if (task.recurring === 'monthly') return taskDate <= checkDate && taskDate.getDate() === checkDate.getDate();
  return false;
}

function renderCalendar(year, month) {
  calendarBody.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = startingDay;
  let dayCounter = 1;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  for (let row = 0; row < 6; row++) {
    const tr = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const td = document.createElement('td');
      const dayInMonth = (row * 7 + i >= prevMonthDays) && (dayCounter <= totalDays);

      if (dayInMonth) {
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(dayCounter).padStart(2,'0')}`;
        td.textContent = dayCounter;

        if (dateStr === todayStr) {
          td.classList.add('today');
        }

        const tasksOnDay = tasks.filter(t => matchesRecurring(t, dateStr));

        if (tasksOnDay.length > 0) {
          td.classList.add('has-task');
          td.style.cursor = 'pointer';

          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.innerText = tasksOnDay.map(t => `${t.time} - ${t.description}${t.recurring !== 'none' ? ' (Recorrente)' : ''}`).join('\n');
          td.appendChild(tooltip);

          td.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
          });
          td.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
          });

          td.addEventListener('click', () => {
            alert(`Tarefas em ${dateStr}:\n\n${tasksOnDay.map(t => `${t.time} - ${t.description}${t.recurring !== 'none' ? ' (Recorrente)' : ''}`).join('\n')}`);
          });
        }

        dayCounter++;
      } else {
        td.classList.add('empty');
        td.textContent = '';
      }

      tr.appendChild(td);
    }

    calendarBody.appendChild(tr);
  }
}

// Modal management
const taskModal = document.getElementById('taskModal');
const taskListDiv = document.getElementById('taskList');

function openTaskManager() {
  renderTaskManager();
  taskModal.style.display = 'block';
}
function closeTaskManager() {
  taskModal.style.display = 'none';
}
window.onclick = function(event) {
  if (event.target == taskModal) {
    taskModal.style.display = 'none';
  }
}

function renderTaskManager() {
  if (tasks.length === 0) {
    taskListDiv.innerHTML = '<p>Nenhuma tarefa cadastrada.</p>';
    return;
  }

  taskListDiv.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.classList.add('task-item');

    div.innerHTML = `
      <strong>${task.date} ${task.time}</strong> - ${task.description} ${task.recurring !== 'none' ? ` (Recorrente: ${task.recurring})` : ''}
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${task.id})">Editar</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Excluir</button>
      </div>
    `;

    taskListDiv.appendChild(div);
  });
}

// Botões de navegação do calendário
prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

// Notificações Push
if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

setInterval(() => {
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const nowTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  tasks.forEach(task => {
    if (matchesRecurring(task, nowStr) && task.time === nowTime) {
      sendNotification(task);
    }
  });
}, 60000);

function sendNotification(task) {
  if (Notification.permission === 'granted') {
    new Notification(`Tarefa às ${task.time}`, {
      body: `${task.description}${task.recurring !== 'none' ? ' (Recorrente)' : ''}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827565.png'
    });
  }
}

// Inicialização
renderCalendar(currentYear, currentMonth);

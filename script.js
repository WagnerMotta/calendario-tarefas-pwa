
function addTask() {
  const date = document.getElementById('task-date').value;
  const time = document.getElementById('task-time').value;
  const desc = document.getElementById('task-desc').value;
  if (date && time && desc) {
    const task = { date, time, description: desc };
    saveTask(task);
    scheduleNotification(task);
  }
}

function saveTask(task) {
  const list = document.getElementById('task-list');
  const li = document.createElement('li');
  li.textContent = `${task.date} ${task.time} - ${task.description}`;
  list.appendChild(li);
}

function scheduleNotification(task) {
  if (Notification.permission === 'granted') {
    const notifyTime = new Date(`${task.date}T${task.time}`);
    const delay = notifyTime - new Date();
    if (delay > 0) {
      setTimeout(() => {
        new Notification('Lembrete de Tarefa', {
          body: `${task.description} às ${task.time}`,
          icon: '/icons/icon-192.png'
        });
      }, delay);
    }
  }
}

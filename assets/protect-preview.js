(() => {
  const panel = document.querySelector('.wifi-preview-panel');
  const controls = document.createElement('section');
  controls.className = 'protect-preview-controls';
  controls.innerHTML = '<button class="preview-action" aria-pressed="false">日历记录</button>';
  panel.prepend(controls);
  const records = controls.querySelector('button');
  function updateRecords() {
    const age = Math.round((today - selectedDate) / 86400000);
    const hasRecords = records.getAttribute('aria-pressed') === 'true' && age >= 0 && age < 7;
    const counts = hasRecords ? [128 - age * 13, 24 - age * 2, 56 - age * 5] : [0, 0, 0];
    calendarDialog.querySelectorAll('.day-stats strong').forEach((value, index) => { value.textContent = counts[index]; });
    calendarDialog.querySelector('.empty-day').hidden = hasRecords;
  }
  records.addEventListener('click', () => {records.setAttribute('aria-pressed', records.getAttribute('aria-pressed') !== 'true');updateRecords();});
  document.addEventListener('blocking-calendar-rendered', updateRecords);
  updateRecords();
})();

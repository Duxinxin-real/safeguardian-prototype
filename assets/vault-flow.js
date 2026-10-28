(() => {
  const homeMarkup = vaultPage.innerHTML;
  const state = { page: 'intro', icon: 'Default', main: '', decoy: '', draft: '', input: '', mode: 'main', confirmed: false, editing: false, space: 'main', media: [] };
  const arrow = '<svg><use href="#arrow"/></svg>';
  const action = (name, label, extra = '') => `<button data-action="${name}" ${extra}>${label}</button>`;
  const primary = (name, label = 'Continue') => action(name, label, 'class="flow-primary"');
  const back = () => action('back', arrow, 'class="flow-back" aria-label="Back"');
  const selected = new Set();
  let selecting = false;
  let decoyPhotoVisible = true;
  const viewer = document.createElement('dialog');
  viewer.className = 'vault-media-viewer';
  viewer.setAttribute('aria-label', 'Media preview');
  phone.append(viewer);
  const deleteDialog = document.createElement('dialog');
  deleteDialog.className = 'vault-delete-dialog';
  deleteDialog.setAttribute('aria-labelledby', 'vault-delete-title');
  phone.append(deleteDialog);
  function dismissDelete() {
    if (deleteDialog.open) deleteDialog.close();
    deleteDialog.replaceChildren();
    vaultPage.inert = false;
    phone.querySelector('.tabs').inert = false;
  }
  function confirmDelete() {
    deleteDialog.innerHTML = `<div class="ios-alert"><h2 id="vault-delete-title">Delete ${selected.size} ${selected.size === 1 ? 'Item' : 'Items'}?</h2><p>This removes them from your Vault.<br>Original files will not be deleted.</p><div class="ios-alert-actions"><button data-delete="cancel">Cancel</button><button data-delete="confirm">Delete</button></div></div>`;
    vaultPage.inert = true;
    phone.querySelector('.tabs').inert = true;
    deleteDialog.show();
    deleteDialog.querySelector('[data-delete="cancel"]').focus();
  }
  deleteDialog.addEventListener('click', event => {
    const choice = event.target.closest('[data-delete]')?.dataset.delete;
    if (!choice) return;
    dismissDelete();
    if (choice !== 'confirm') return;
    if (state.space === 'decoy') decoyPhotoVisible = false;
    else state.media = state.media.filter(item => {
      if (!selected.has(item.url)) return true;
      URL.revokeObjectURL(item.url); return false;
    });
    selected.clear(); selecting = false; render();
  });
  deleteDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dismissDelete(); }
    if (event.key === 'Tab') {
      event.preventDefault();
      const buttons = [...deleteDialog.querySelectorAll('button')];
      buttons[(buttons.indexOf(document.activeElement) + 1) % buttons.length].focus();
    }
  });
  function albumItems() {
    if (state.space === 'main') return state.media.filter(item => item.kind === state.album);
    return state.album === 'image' && decoyPhotoVisible ? [{url:'landscape', name:'Mountain lake', kind:'image'}] : [];
  }
  function closeViewer() {
    viewer.querySelector('video')?.pause();
    if (viewer.open) viewer.close();
    viewer.replaceChildren();
    vaultPage.inert = false;
    phone.querySelector('.tabs').inert = false;
  }
  function openViewer(item) {
    closeViewer();
    const close = document.createElement('button');
    close.textContent = 'Close';
    close.className = 'viewer-close';
    close.addEventListener('click', closeViewer);
    const media = document.createElement(item.url === 'landscape' ? 'div' : item.kind === 'image' ? 'img' : 'video');
    if (item.url === 'landscape') { media.className = 'landscape-preview'; media.setAttribute('role','img'); media.setAttribute('aria-label',item.name); }
    else {
      media.src = item.url;
      if (item.kind === 'image') media.alt = item.name;
      else { media.controls = true; media.playsInline = true; }
    }
    viewer.append(close, media);
    vaultPage.inert = true;
    phone.querySelector('.tabs').inert = true;
    viewer.show();
    close.focus();
  }
  viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
  });
  function shell(content, kind) {
    vaultPage.innerHTML = `<header class="vault-heading"><h1>Vault</h1></header><section class="vault-flow ${kind}">${content}</section>`;
    vaultPage.scrollTop = 0;
  }
  function render() {
    closeViewer();
    dismissDelete();
    if (state.page === 'intro') {
      shell(`<div class="intro-art" role="img" aria-label="Private photos and videos protected by a lock"></div><h2>Just for you.</h2><p>Keep personal photos and videos<br>behind your passcode.</p><div class="flow-benefits"><div><span class="benefit-art keys"></span>Dual Passcodes</div><div><span class="benefit-art app-icons"></span>Change App Icon</div></div>${primary('next')}`, 'flow-intro');
    } else if (state.page === 'icons') {
      shell(`${back()}<h2>Choose your look</h2><div class="icon-preview look-${state.icon.toLowerCase()}" role="img" aria-label="${state.icon} icon"></div><div class="icon-options" role="group" aria-label="App appearance">${['Default', 'Calculator', 'Weather'].map(name => action('icon', `<span class="choice-art look-${name.toLowerCase()}"></span><strong>${name}</strong>`, `data-icon="${name}" aria-pressed="${state.icon === name}" class="icon-option ${state.icon === name ? 'selected' : ''}"`)).join('')}</div><p>Choose an appearance for your vault.</p><div class="flow-footer">${primary('next', state.editing ? 'Save' : 'Continue')}${action('skip', state.editing ? 'Cancel' : 'Skip', 'class="flow-link"')}</div>`, 'flow-icons');
    } else if (state.page === 'tutorial') {
      shell(`${back()}<h2>Two ways in</h2><div class="tutorial-art main-art" role="img" aria-label="Main key opens private photos"></div><h3>Main passcode</h3><p>Opens your private space.</p><div class="tutorial-art decoy-art" role="img" aria-label="Second key opens landscape photos"></div><h3>Decoy passcode</h3><p>Opens your display space.</p><small>The second passcode is optional.</small>${primary('next')}`, 'flow-tutorial');
    } else if (state.page === 'pin' || state.page === 'unlock') {
      const unlocking = state.page === 'unlock';
      const title = unlocking ? 'Enter passcode' : `${state.confirmed ? 'Confirm' : 'Create'} ${state.mode === 'main' ? 'Main' : 'Decoy'} passcode`;
      const pinIcon = unlocking
        ? '<span class="pin-lock badge blue"><svg><use href="#lock"/></svg></span>'
        : `<span class="pin-lock tutorial-key ${state.mode === 'main' ? 'main-key' : 'decoy-key'}" role="img" aria-label="${state.mode === 'main' ? 'Main' : 'Decoy'} passcode key"></span>`;
      shell(`${unlocking ? '' : back()}${pinIcon}<h2>${title}</h2><p>${state.confirmed ? 'Enter your code again.' : 'Enter a 4-digit code.'}</p><div class="pin-dots" role="status" aria-label="0 of 4 digits entered">${'<span></span>'.repeat(4)}</div><div class="pin-error" role="alert"></div><div class="pin-pad">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(digit => digit ? action('digit', digit, `data-digit="${digit}" aria-label="${digit === '⌫' ? 'Delete digit' : digit}"`) : '<span></span>').join('')}</div>${primary('submit', unlocking ? 'Unlock' : 'Continue')}${!unlocking && state.mode === 'decoy' && !state.confirmed ? action('skip-decoy', 'Skip for now', 'class="flow-link"') : ''}`, 'flow-pin');
      updatePin();
    } else if (state.page === 'home') {
      vaultPage.innerHTML = homeMarkup;
      if (state.space === 'decoy') vaultPage.querySelector('.privacy-setup').remove();
      else {
        vaultPage.querySelector('[data-vault="Disguise"] .vault-value').textContent = state.icon;
        vaultPage.querySelector('[data-vault="Passcodes"] .vault-value').textContent = state.decoy ? 'Dual' : 'Single';
        vaultPage.querySelector('[data-vault="Decoy Space"] .vault-value').textContent = state.decoy ? 'Enabled' : 'Set up';
      }
      for (const [kind, selector, label] of [['image', '.photos', 'Photos'], ['video', '.videos', 'Videos']]) {
        const album = vaultPage.querySelector(selector);
        const items = state.space === 'main' ? state.media.filter(item => item.kind === kind) : [];
        const count = state.space === 'decoy' && kind === 'image' ? Number(decoyPhotoVisible) : items.length;
        album.querySelector('.album-caption small').textContent = count;
        album.setAttribute('aria-label', `${label}, ${count} items`);
        if (!count) {
          album.classList.add('album-empty');
          album.querySelector('.album-art').innerHTML = `<span class="empty-media-icon asset-icon" style="--icon:url(icons/${kind === 'image' ? 'image' : 'video'}.svg)" aria-hidden="true"></span>`;
          album.querySelector('.play-mark')?.remove();
        } else if (items.length) {
          const cover = document.createElement(kind === 'image' ? 'img' : 'video');
          cover.src = items[0].url;
          cover.className = 'imported-cover';
          if (kind === 'image') cover.alt = '';
          else { cover.muted = true; cover.preload = 'metadata'; }
          album.querySelector('.album-art').replaceChildren(cover);
        }
      }
    } else if (state.page === 'passcodes') {
      shell(`${back()}<h2>Passcodes</h2><div class="passcode-settings">${action('edit-main', '<span class="tutorial-key main-key"></span><strong>Main passcode</strong>' + arrow, 'class="passcode-setting"')}${action('edit-decoy', '<span class="tutorial-key decoy-key"></span><strong>Decoy passcode</strong><span class="vault-value">' + (state.decoy ? 'On' : 'Set up') + '</span>' + arrow, 'class="passcode-setting"')}</div>`, 'flow-passcodes');
    } else if (state.page === 'album') {
      const items = albumItems();
      shell(`${back()}<h2>${state.album === 'image' ? 'Photos' : 'Videos'}</h2>${items.length ? action('select', selecting ? 'Cancel' : 'Select', 'class="media-select"') : ''}<div class="media-grid"></div>${selecting ? action('delete-media', `Delete (${selected.size})`, `class="flow-primary media-delete" ${selected.size ? '' : 'disabled'}`) : state.space === 'main' ? primary('import', 'Add Media') : ''}`, 'flow-album');
      const grid = vaultPage.querySelector('.media-grid');
      if (!items.length) grid.innerHTML = '<p>No media yet.</p>';
      items.forEach(item => {
        const tile = document.createElement('button');
        tile.className = 'media-tile';
        tile.setAttribute('aria-label', `${selecting ? 'Select' : 'View'} ${item.name}`);
        if (selecting) tile.setAttribute('aria-pressed', String(selected.has(item.url)));
        const media = document.createElement(item.url === 'landscape' ? 'div' : item.kind === 'image' ? 'img' : 'video');
        if (item.url === 'landscape') media.className = 'landscape-preview';
        else { media.src = item.url; if (item.kind === 'video') { media.muted = true; media.preload = 'metadata'; } else media.alt = ''; }
        tile.append(media);
        if (selecting) {
          const check = document.createElement('span'); check.className = 'media-check'; check.textContent = selected.has(item.url) ? '✓' : ''; tile.append(check);
        } else if (item.kind === 'video') {
          const label = document.createElement('span'); label.className = 'media-video-label'; label.textContent = 'Video'; tile.append(label);
        }
        tile.addEventListener('click', () => {
          if (!selecting) { openViewer(item); return; }
          if (selected.has(item.url)) selected.delete(item.url); else selected.add(item.url);
          render();
        });
        grid.append(tile);
      });
    }
  }
  function updatePin(message = '') {
    vaultPage.querySelectorAll('.pin-dots span').forEach((dot, index) => dot.classList.toggle('filled', index < state.input.length));
    vaultPage.querySelector('.pin-dots').setAttribute('aria-label', `${state.input.length} of 4 digits entered`);
    vaultPage.querySelector('[data-action="submit"]').disabled = state.input.length !== 4;
    vaultPage.querySelector('.pin-error').textContent = message;
  }
  function pin(mode) {
    state.mode = mode; state.input = ''; state.draft = ''; state.confirmed = false; state.page = 'pin'; render();
  }
  function home() { state.page = 'home'; state.editing = false; state.input = ''; render(); }
  function submit() {
    if (state.input.length !== 4) return;
    if (state.page === 'unlock') {
      if (state.input === state.main || (state.decoy && state.input === state.decoy)) {
        state.space = state.input === state.main ? 'main' : 'decoy'; home();
      } else { state.input = ''; updatePin('Incorrect passcode. Try again.'); }
      return;
    }
    if (!state.confirmed) {
      if (state.input === (state.mode === 'decoy' ? state.main : state.decoy)) { state.input = ''; updatePin('Choose a different passcode.'); return; }
      state.draft = state.input; state.input = ''; state.confirmed = true; render(); return;
    }
    if (state.input !== state.draft) { state.input = ''; updatePin('Codes do not match. Try again.'); return; }
    state[state.mode] = state.input; state.input = ''; state.draft = '';
    if (state.editing) { state.page = 'passcodes'; state.confirmed = false; render(); }
    else if (state.mode === 'main') pin('decoy'); else home();
  }
  function importMedia() {
    if (state.space !== 'main') return;
    const picker = document.createElement('input'); picker.type = 'file'; picker.accept = 'image/*,video/*'; picker.multiple = true;
    picker.addEventListener('change', () => {
      for (const file of picker.files) if (/^(image|video)\//.test(file.type)) state.media.push({name: file.name, kind: file.type.split('/')[0], url: URL.createObjectURL(file)});
      render();
    });
    picker.click();
  }
  vaultPage.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    const command = button.dataset.action;
    if (command === 'next') {
      if (state.page === 'intro') state.page = 'icons';
      else if (state.page === 'icons') { if (state.editing) { home(); return; } state.page = 'tutorial'; }
      else { pin('main'); return; }
      render();
    } else if (command === 'icon') { state.icon = button.dataset.icon; render(); }
    else if (command === 'skip') { state.icon = state.previousIcon || 'Default'; if (state.editing) home(); else { state.page = 'tutorial'; render(); } }
    else if (command === 'back') {
      if (state.page === 'pin' && state.editing) { state.page = 'passcodes'; state.input = ''; state.draft = ''; state.confirmed = false; render(); return; }
      if (state.page === 'album' || state.editing) { home(); return; }
      if (state.page === 'pin' && state.confirmed) { state.confirmed = false; state.input = ''; }
      else if (state.page === 'pin' && state.mode === 'decoy') { pin('main'); return; }
      else state.page = {icons:'intro', tutorial:'icons', pin:'tutorial'}[state.page] || 'home';
      render();
    } else if (command === 'digit') { state.input = button.dataset.digit === '⌫' ? state.input.slice(0,-1) : (state.input + button.dataset.digit).slice(0,4); updatePin(); }
    else if (command === 'submit') submit();
    else if (command === 'skip-decoy') { if (state.editing) { state.page = 'passcodes'; render(); } else home(); }
    else if (command === 'edit-main') pin('main');
    else if (command === 'edit-decoy') pin('decoy');
    else if (command === 'select') { selecting = !selecting; selected.clear(); render(); }
    else if (command === 'delete-media') {
      if (selected.size) confirmDelete();
    }
    else if (command === 'import' || button.matches('.add-media')) importMedia();
    else if (button.matches('.lock-now')) { state.page = 'unlock'; state.input = ''; render(); }
    else if (button.matches('.album')) { selected.clear(); selecting = false; state.album = button.matches('.photos') ? 'image' : 'video'; state.page = 'album'; render(); }
    else if (button.dataset.vault && state.space === 'main') {
      state.editing = true;
      if (button.dataset.vault === 'Disguise') { state.previousIcon = state.icon; state.page = 'icons'; render(); }
      else if (button.dataset.vault === 'Passcodes') { state.page = 'passcodes'; render(); }
      else { state.space = 'decoy'; home(); }
    }
  });
  document.addEventListener('keydown', event => {
    if (vaultPage.hidden || !['pin','unlock'].includes(state.page)) return;
    if (/^\d$/.test(event.key)) { event.preventDefault(); state.input = (state.input + event.key).slice(0,4); updatePin(); }
    else if (event.key === 'Backspace') { event.preventDefault(); state.input = state.input.slice(0,-1); updatePin(); }
    else if (event.key === 'Enter') { event.preventDefault(); submit(); }
  });
  document.querySelector('.tabs').addEventListener('click', event => {
    if (!event.target.closest('button') || event.target.closest('button') === liveVaultTab) return;
    if (state.main) { state.page = 'unlock'; state.input = ''; state.editing = false; render(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.main) { state.page = 'unlock'; state.input = ''; render(); }
  });
  render();
})();

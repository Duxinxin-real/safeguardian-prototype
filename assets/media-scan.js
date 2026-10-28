window.SensitiveMedia = (() => {
  const samples = ['assets/media-sample.png','assets/me-concept.png','assets/guide-media.png','assets/guide-web.png'];
  const items = samples.map((src,index)=>({id:index,src,hidden:false,deleted:false,backed:false}));
  const selected = new Set();
  let scanned=false, timer, progress=0, screen='results', blurred=true, password='', draft='', unlocked=false, pendingBackup=false;
  let host, shell, confirmAction, requestAccess, permission;
  const action=(name,label,disabled=false)=>`<button type="button" class="utility-button" data-media="${name}" ${disabled?'disabled':''}>${label}</button>`;
  function stop(){clearInterval(timer);unlocked=false;draft='';pendingBackup=false;}
  function mount(options){
    ({host,shell,confirmAction,requestAccess,permission}=options);
    screen='results';unlocked=false;
    if(!permission){welcome();return;}
    if(!scanned)scan();else render();
  }
  function bind(){
    host.querySelectorAll('[data-media]').forEach(button=>button.onclick=()=>handle(button.dataset.media));
    host.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>preview(Number(button.dataset.photo)));
    host.querySelectorAll('[data-select]').forEach(button=>button.onclick=()=>{
      const id=Number(button.dataset.select);
      selected.has(id)?selected.delete(id):selected.add(id);render();
    });
  }
  function welcome(){
    shell('Sensitive Media',`<section class="utility-card media-welcome"><div class="media-empty-art" aria-hidden="true"><div class="media-photo-back"></div><div class="media-photo-front"><svg><use href="#photo"/></svg></div><span class="media-lock"><svg><use href="#lock"/></svg></span></div><h2>Find private photos</h2><p>Scan your library for potentially sensitive photos and screenshots.</p><div class="media-welcome-action">${action('access','Allow Photo Access')}</div></section>`);bind();
  }
  function scan(){
    clearInterval(timer);selected.clear();progress=0;screen='scan';
    shell('Sensitive Media',`<section class="utility-card scan-card"><div class="scan-art"><img src="assets/media-sample.png" alt=""><span></span></div><h2>Scanning photos</h2><p class="scan-count" role="status">0 of 48 photos</p><progress max="48" value="0" aria-label="Scanning progress"></progress>${action('cancel','Cancel')}</section>`);bind();
    timer=setInterval(()=>{
      progress=Math.min(48,progress+3);
      host.querySelector('.scan-count').textContent=`${progress} of 48 photos`;
      host.querySelector('progress').value=progress;
      if(progress===48){clearInterval(timer);scanned=true;screen='results';render();}
    },240);
  }
  function visible(){return items.filter(item=>screen==='backup'?item.backed:!item.deleted&&(screen==='hidden'?item.hidden:!item.hidden));}
  function icon(symbol){return '<svg aria-hidden="true"><use href="#'+symbol+'"/></svg>';}
  function sheet(title,body){
    const overlay=document.createElement('div');overlay.className='media-overlay';
    overlay.innerHTML='<section class="media-choice-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="media-sheet-heading"><h2>'+title+'</h2><button class="media-sheet-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>'+body+'</section>';
    const phone=host.closest('.phone');
    const children=[host,phone.querySelector('.tabs')];children.forEach(child=>child.inert=true);
    const previousFocus=document.activeElement;
    function dismiss(){overlay.remove();children.forEach(child=>child.inert=false);previousFocus?.focus();}
    phone.append(overlay);
    overlay.querySelector('.media-sheet-close').onclick=dismiss;
    overlay.onclick=event=>{if(event.target===overlay)dismiss();};
    overlay.querySelectorAll('[data-media]').forEach(button=>button.onclick=()=>{dismiss();handle(button.dataset.media);});
    overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();dismiss();}
      if(event.key==='Tab'){
        const controls=[...overlay.querySelectorAll('button')],first=controls[0],last=controls[controls.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    });
    overlay.querySelector('button').focus();
  }
  function choice(command,title,description,symbol){
    return '<button class="media-choice" data-media="'+command+'"><span class="badge blue">'+icon(symbol)+'</span><span><strong>'+title+'</strong><small>'+description+'</small></span>'+icon('arrow')+'</button>';
  }
  function preview(id){
    const item=items.find(photo=>photo.id===id);
    sheet('Photo', '<img class="media-preview-photo" src="'+item.src+'" alt="Selected photo">'+action('select-'+id,selected.has(id)?'Deselect Photo':'Select Photo'));
  }
  function completed(count,label){
    shell('Sensitive Media','<section class="utility-card media-complete"><span class="badge green">'+icon('shield')+'</span><h2>'+count+' '+(count===1?'photo':'photos')+' '+label+'</h2>'+action('results','Done')+'</section>');bind();
  }
  function render(){
    if(screen==='pin'){pin();return;}
    const list=visible();
    const title=screen==='backup'?'Private Backup':screen==='hidden'?'Hidden Photos':'Sensitive Media';
    shell(title,'<section class="utility-card media-library media-review"><div class="media-toolbar"><div><h2>'+list.length+(screen==='results'?' photos to review':' Photos')+'</h2></div><button class="media-manage" data-media="manage" aria-label="Manage photos"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button></div>'+(list.length?'<p class="media-review-note">Tap to view. Select to manage.</p>':'')+'<div class="utility-grid">'+list.map(item=>'<div class="media-review-tile"><button class="utility-thumb blurred" data-photo="'+item.id+'" aria-label="View photo '+(item.id+1)+'"><img src="'+item.src+'" alt=""></button><button class="media-select-photo" data-select="'+item.id+'" aria-label="Select photo '+(item.id+1)+'" aria-pressed="'+selected.has(item.id)+'">'+(selected.has(item.id)?'<svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg>':'')+'</button></div>').join('')+'</div>'+(!list.length?'<div class="media-no-results"><span class="badge blue">'+icon('photo')+'</span><h2>All clear</h2><p>No photos to review.</p></div>':'')+'<div class="media-primary-action">'+(list.length?action('process',selected.size?'Manage '+selected.size+' Selected':'Select Photos',!selected.size):action('results','Done'))+'</div></section>');bind();
  }
  function pin(){
    const title=password?'Unlock Backup':draft?'Confirm Passcode':'Create Passcode';
    shell('Private Backup',`<section class="utility-card media-pin"><span class="badge blue"><svg><use href="#lock"/></svg></span><h2>${title}</h2><p>${password?'Enter your backup passcode.':'Use a 4-digit code for your backup.'}</p><form><input aria-label="Backup passcode" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" minlength="4" autocomplete="off" required><p class="pin-error" role="alert"></p><button class="utility-button">Continue</button></form>${action('results','Cancel')}</section>`);bind();
    host.querySelector('form').onsubmit=event=>{
      event.preventDefault();const value=host.querySelector('input').value;
      if(!/^\d{4}$/.test(value))return;
      if(password&&value!==password){host.querySelector('.pin-error').textContent='Incorrect passcode. Try again.';return;}
      if(!password&&!draft){draft=value;pin();return;}
      if(!password&&draft!==value){host.querySelector('.pin-error').textContent='Codes do not match. Try again.';return;}
      if(!password)password=value;
      draft='';unlocked=true;
      if(pendingBackup)save();else{screen='backup';selected.clear();render();}
    };
  }
  function save(){const count=selected.size;items.forEach(item=>{if(selected.has(item.id))item.backed=true;});selected.clear();pendingBackup=false;screen='results';completed(count,'backed up');}
  function handle(command){
    if(command.startsWith('select-')){const id=Number(command.slice(7));selected.has(id)?selected.delete(id):selected.add(id);render();return;}
    if(command==='manage'){
      sheet('Manage Photos',choice('hidden','Hidden Photos','View and restore hidden photos.','eye')+choice('backup','Private Backup','Open your passcode-protected copies.','lock')+choice('scan','Scan Again','Check your photo library again.','photo'));return;
    }
    if(command==='process'){
      if(!selected.size)return;
      sheet('Manage '+selected.size+' Photos',screen==='backup'?choice('results','Keep in Backup','Return to scan results.','lock'):choice('save','Back Up with Passcode','Keep a private copy. Originals stay unchanged.','lock')+choice(screen==='hidden'?'unhide':'hide',screen==='hidden'?'Unhide Photos':'Hide Photos',screen==='hidden'?'Return selected photos to your review.':'Move selected photos out of your review.','eye')+choice('delete','Delete Photos','Remove originals. Keep existing backup copies.','ban'));return;
    }
    if(command==='access'){requestAccess();return;}
    if(command==='scan'){scan();return;}
    if(command==='cancel'){clearInterval(timer);welcome();return;}
    if(command==='blur'){blurred=!blurred;render();return;}
    if(command==='all'){const list=visible(),all=list.every(item=>selected.has(item.id));selected.clear();if(!all)list.forEach(item=>selected.add(item.id));render();return;}
    if(command==='backup'||command==='save'){
      pendingBackup=command==='save';
      if(!unlocked){screen='pin';draft='';pin();}else if(pendingBackup)save();else{selected.clear();screen='backup';render();}return;
    }
    if(command==='delete'||command==='hide'||command==='unhide'){
      const count=selected.size;if(!count)return;
      confirmAction(command==='delete'?`Delete ${count} Photos?`:command==='hide'?`Hide ${count} Photos?`:`Unhide ${count} Photos?`,command==='delete'?'Selected photos will be removed from your library. Backup copies will be kept.':command==='hide'?'Selected photos will move to Hidden Photos.':'Selected photos will return to your review.',()=>{
        items.forEach(item=>{if(!selected.has(item.id))return;if(command==='delete')item.deleted=true;else item.hidden=command==='hide';});selected.clear();screen='results';completed(count,command==='delete'?'deleted':command==='hide'?'hidden':'restored');
      });return;
    }
    if(command==='lock'){unlocked=false;screen='pin';pin();return;}
    selected.clear();pendingBackup=false;draft='';screen=command==='hidden'?'hidden':'results';if(screen==='results')unlocked=false;render();
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){unlocked=false;if(screen==='backup'&&host&&!host.hidden){screen='pin';pin();}}});
  return {mount,stop};
})();

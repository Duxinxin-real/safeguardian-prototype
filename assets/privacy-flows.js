(() => {
  const state = {page:'', permission:{web:false,calls:false,sms:false}, enabled:{ads:false,popups:false,trackers:false,calls:false,sms:false}, numbers:[], rules:{promotions:true,scams:true}};
  const metadata = {name:'SafeGuardian',version:'1.0.0',privacy:'',terms:'',email:''};
  let stopGuide = () => {};
  const descriptions = {
    ads:['Ad blocking','ban','red','Reduce distracting ads while browsing in Safari.'],
    popups:['Pop-up blocking','app-window','purple','Block unwanted pop-ups on supported websites.'],
    trackers:['Tracker blocking','eye-off','green','Limit known trackers while browsing in Safari.'],
    calls:['Spam Calls Filter','phone','blue','Identify and block known unwanted callers.'],
    sms:['SMS Filter','message-square','purple','Filter unwanted messages from unknown senders.']
  };
  const page = document.createElement('section'); page.className='utility-page'; page.hidden=true; phone.append(page);
  const alert = document.createElement('section'); alert.className='utility-alert'; alert.hidden=true; phone.append(alert);
  const icon = name => `<span class="asset-icon" style="--icon:url(icons/${name}.svg)" aria-hidden="true"></span>`;
  const button = (command,text,extra='') => `<button class="utility-button" data-command="${command}" ${extra}>${text}</button>`;
  const row = (command,text,value='',symbol='') => `<button class="utility-row" data-command="${command}">${symbol ? icon(symbol) : ''}${text}<span>${value}<svg class="chevron" aria-hidden="true"><use href="#arrow"/></svg></span></button>`;
  const tabs = document.querySelector('.tabs');
  const me = tabs.querySelectorAll('button')[3];
  function shell(title,body,back=true) {
    page.classList.toggle('me-home',state.page==='me');
    page.classList.toggle('me-detail',['about','privacy','terms','feedback'].includes(state.page));
    page.classList.toggle('protect-detail',!me.classList.contains('active'));
    page.innerHTML=`<div class="utility-heading">${back ? '<button class="utility-back" data-command="back" aria-label="Back"><svg><use href="#arrow"/></svg></button>' : ''}<h1>${title}</h1></div>${body}`;
    page.hidden=false; notice.hidden=true;
    document.querySelector('.scroll').inert=true; testPage.inert=true; vaultPage.inert=true;
  }
  function close() {stopGuide();page.classList.remove('showing-guide');page.hidden=true; dismiss(); testPage.inert=false; vaultPage.inert=false; document.querySelector('.scroll').inert=!protectTab.classList.contains('active');}
  function dismiss(){alert.hidden=true;alert.replaceChildren();page.inert=false;tabs.inert=false;}
  function confirm(title,text,done){
    alert.innerHTML=`<div class="ios-alert" role="alertdialog" aria-modal="true" aria-labelledby="utility-alert-title"><h2 id="utility-alert-title">${title}</h2><p>${text}</p><div class="ios-alert-actions"><button>Cancel</button><button>Confirm</button></div></div>`;
    alert.hidden=false;page.inert=true;tabs.inert=true;
    const buttons=alert.querySelectorAll('button');if(title.startsWith('Turn Off'))buttons[1].textContent='Turn Off';buttons[0].onclick=dismiss;buttons[1].onclick=()=>{dismiss();done();};buttons[0].focus();
  }
  alert.addEventListener('keydown',event=>{if(event.key==='Escape')dismiss();if(event.key==='Tab'){event.preventDefault();const buttons=[...alert.querySelectorAll('button')];buttons[(buttons.indexOf(document.activeElement)+1)%2].focus();}});
  function sync(){
    const enabled=state.enabled.ads||state.enabled.popups||state.enabled.trackers;
    phone.classList.toggle('is-active',enabled);protectionSwitch.setAttribute('aria-checked',String(enabled));
    protectionSwitch.setAttribute('aria-label',enabled?'Disable Safari protection':'Enable Safari protection');
    document.querySelector('.state').lastChild.textContent=enabled?'Active':'Inactive';
    ['ads','popups','trackers'].forEach((key,index)=>{document.querySelectorAll('.row-status')[index].textContent=state.enabled[key]?'On':'Off';});
    activeShield.setAttribute('aria-hidden',String(!enabled));inactiveShield.setAttribute('aria-hidden',String(enabled));
  }
  function open(name){state.page=name;render();page.scrollTop=0;}
  function render(){
    
    stopGuide();
    page.classList.toggle('showing-guide',state.page==='tutorial');
    const name=state.page;
    if(descriptions[name]){
      const [title,symbol,color,description]=descriptions[name];
      shell(title,`<section class="utility-card utility-hero"><span class="badge ${color}">${icon(symbol)}</span><h2>${title}</h2><span class="utility-status ${state.enabled[name]?'on':''}">${state.enabled[name]?'On':'Off'}</span><p>${description}</p>${button('toggle',state.enabled[name]?'Turn Off':'Turn On')}</section>${name==='calls'?`<section class="utility-card">${row('numbers','Blocked Numbers',String(state.numbers.length),'phone')}<p>Protection depends on the available number list. Not every unwanted call can be identified.</p></section>`:name==='sms'?`<section class="utility-card">${row('sms-rules','Filter Rules','','message-square')}<p>Filtering does not cover every conversation or messaging app.</p></section>`:'<section class="utility-card"><h2>In Safari</h2><p>Some ads or tracking may still appear. This does not affect other apps.</p></section>'}`);
    }else if(name==='tutorial'){
      const type=state.tutorial;
      const title={web:'Enable Web Cleanup',calls:'Enable Spam Calls',sms:'Enable SMS Filter'}[type];
      shell(title,'<section class="settings-animation"></section>');
      stopGuide=window.SafeGuardianGuide.mount(page.querySelector('.settings-animation'),type);
    }else if(name==='numbers'){
      shell('Blocked Numbers',`<section class="utility-card"><form id="number-form"><label>Phone number<input name="number" inputmode="tel" placeholder="+1 555 123 4567" required maxlength="20"></label>${button('add-number','Add Number','type="submit"')}<p class="utility-error" role="alert"></p></form><div class="number-list"></div></section>`);
      const list=page.querySelector('.number-list');if(!state.numbers.length)list.innerHTML='<p class="utility-empty">No blocked numbers</p>';
      state.numbers.forEach(number=>{const item=document.createElement('button');item.className='utility-row';item.textContent=number;const remove=document.createElement('span');remove.textContent='Remove';item.append(remove);item.onclick=()=>confirm('Remove Number?','This number will be removed from the block list.',()=>{state.numbers=state.numbers.filter(value=>value!==number);render();});list.append(item);});
      page.querySelector('form').onsubmit=event=>{event.preventDefault();const input=page.querySelector('input');const value=input.value.replace(/[\s()-]/g,'');if(!/^\+[1-9]\d{6,14}$/.test(value)){page.querySelector('.utility-error').textContent='Include a country code and a valid number.';return;}if(state.numbers.includes(value)){page.querySelector('.utility-error').textContent='This number is already added.';return;}state.numbers.push(value);render();};
    }else if(name==='sms-rules'){
      shell('Filter Rules',`<section class="utility-card">${row('rule-scams','Suspected scams',state.rules.scams?'On':'Off')}${row('rule-promotions','Promotions',state.rules.promotions?'On':'Off')}<p>Review filtered messages in the Messages app.</p></section>`);
    }else if(name==='me'){

      const meRow=(command,label,color,art)=>`<button class="utility-row" data-command="${command}"><span class="badge ${color}"><svg aria-hidden="true" viewBox="0 0 24 24">${art}</svg></span><span class="me-row-label">${label}</span><svg class="chevron" aria-hidden="true"><use href="#arrow"/></svg></button>`;
      shell('Me',`<section class="utility-card utility-meta"><div class="me-logo" role="img" aria-label="SafeGuardian shield"><img src="assets/me-concept.png" alt=""></div><h2 class="app-name"></h2><p class="app-version"></p></section><section class="utility-card me-menu">${meRow('about','About','blue','<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>')}${meRow('privacy','Privacy Policy','purple','<use href="#lock"/>')}${meRow('terms','Terms of Use','blue','<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/>')}${meRow('feedback','Feedback','green','<path d="M21 11a8 8 0 0 1-8 8H7l-5 3V7a5 5 0 0 1 5-5h6a8 8 0 0 1 8 9Z"/><path d="M7 10h.1M12 10h.1M17 10h.1"/>')}</section>`,false);
      page.querySelector('.app-name').textContent=metadata.name;page.querySelector('.app-version').textContent='Version '+metadata.version;
    }else if(name==='about')shell('About',`<section class="utility-card about-brand"><div class="me-logo" role="img" aria-label="SafeGuardian shield"><img src="assets/me-concept.png" alt=""></div><h2>SafeGuardian</h2><p>Version 1.0.0</p></section><section class="utility-card about-features"><h2>Privacy, in one place.</h2><div><span class="badge blue"><svg><use href="#shield"/></svg></span><span>Browse with fewer distractions</span></div><div><span class="badge purple"><svg><use href="#gauge"/></svg></span><span>Check your connection</span></div><div><span class="badge green"><svg><use href="#lock"/></svg></span><span>Keep personal media private</span></div></section>`);
    else if(name==='privacy'||name==='terms'){
      shell(name==='privacy'?'Privacy Policy':'Terms of Use',`<section class="utility-card legal-state"><span class="badge ${name==='privacy'?'purple':'blue'}"><svg aria-hidden="true"><use href="#${name==='privacy'?'shield':'window'}"/></svg></span><h2>${metadata[name]?'SafeGuardian':'Document unavailable'}</h2>${metadata[name]?button('open-document','Open Document'):'<p>Please try again later.</p>'}</section>`);
    }else if(name==='feedback'){
      shell('Feedback',`<section class="utility-card feedback-card"><form id="feedback-form"><fieldset class="feedback-topics"><legend>Topic</legend>${['Suggestion','Problem','Other'].map((topic,index)=>`<label><input type="radio" name="topic" value="${topic}" ${index===0?'checked':''}><span>${topic}</span></label>`).join('')}</fieldset><label class="feedback-message">Message<textarea name="message" rows="8" maxlength="3000" required placeholder="How can we help?"></textarea></label>${button('send-feedback','Send Feedback','type="submit"')}<p class="feedback-status" role="status"></p></form></section>`);
      page.querySelector('textarea').value=state.feedbackDraft||'';
      page.querySelector('textarea').oninput=event=>{state.feedbackDraft=event.target.value;};
      page.querySelector('form').onsubmit=event=>{event.preventDefault();const form=new FormData(event.target);if(!metadata.email){state.feedbackDraft=String(form.get('message'));page.querySelector('.feedback-status').textContent='Unable to send. Please try again later.';return;}location.href=`mailto:${metadata.email}?subject=${encodeURIComponent(form.get('topic'))}&body=${encodeURIComponent(form.get('message'))}`;};
    }
  }
  function tutorial(type,returnTo){state.tutorial=type;state.returnTo=returnTo;open('tutorial');}
  function returnFromTutorial(){if(state.returnTo==='home'){state.page='';close();}else open(state.returnTo);}
  page.addEventListener('click',event=>{
    const command=event.target.closest('[data-command]')?.dataset.command;if(!command)return;
    if(command==='back'){if(state.page==='tutorial')returnFromTutorial();else if(['numbers','sms-rules'].includes(state.page))open(state.page==='numbers'?'calls':'sms');else if(['about','privacy','terms','feedback'].includes(state.page))open('me');else close();}
    else if(command==='toggle'){
      const key=state.page;const permission=['ads','popups','trackers'].includes(key)?'web':key;
      if(state.enabled[key])confirm('Turn Off Protection?','This protection will be paused.',()=>{state.enabled[key]=false;sync();render();});
      else if(!state.permission[permission])tutorial(permission,key);
      else{state.enabled[key]=true;sync();render();}
    }else if(command==='settings'){
      const permission=state.tutorial;
      state.permission[permission]=true;
      if(permission==='web')['ads','popups','trackers'].forEach(key=>{state.enabled[key]=true;});
      else state.enabled[permission]=true;
      sync();
      config.querySelectorAll('[data-grant]').forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.grant==='on')));
      returnFromTutorial();
    }
    else if(command==='rule-scams'||command==='rule-promotions'){const key=command.slice(5);state.rules[key]=!state.rules[key];render();}
    else if(command==='open-document'){const url=metadata[state.page];if(/^https:\/\//.test(url))window.open(url,'_blank','noopener,noreferrer');}
    else if(['numbers','sms-rules','about','privacy','terms','feedback'].includes(command))open(command);
  });
  const toolRows=document.querySelector('.tools');toolRows.innerHTML=row('sms','SMS Filter','','message-square');
  toolRows.insertAdjacentHTML('beforebegin',row('calls','Spam Calls Filter','','phone'));
  toolRows.previousElementSibling.addEventListener('click',()=>open('calls'));
  toolRows.addEventListener('click',event=>{const name=event.target.closest('[data-command]')?.dataset.command;if(name)open(name);});
  document.querySelectorAll('.row-status').forEach((status,index)=>{const old=status.closest('button');const fresh=old.cloneNode(true);fresh.removeAttribute('data-message');old.replaceWith(fresh);fresh.onclick=()=>open(['ads','popups','trackers'][index]);});
  protectionSwitch.addEventListener('click',event=>{
    event.stopImmediatePropagation();
    if(!state.permission.web){tutorial('web','home');return;}
    if(state.enabled.ads||state.enabled.popups||state.enabled.trackers)confirm('Turn Off Web Cleanup?','Ad, pop-up and tracker protection will be paused.',()=>{['ads','popups','trackers'].forEach(key=>state.enabled[key]=false);sync();});
    else{['ads','popups','trackers'].forEach(key=>state.enabled[key]=true);sync();}
  },true);
  tabs.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;close();
    if(target!==me){me.classList.remove('active');me.removeAttribute('aria-current');}
    if(target===me){event.stopImmediatePropagation();stopSpeedTest();testPage.hidden=true;vaultPage.hidden=true;phone.classList.remove('test-visible','vault-visible');tabs.querySelectorAll('button').forEach(tab=>{tab.classList.toggle('active',tab===me);tab.removeAttribute('aria-current');});me.setAttribute('aria-current','page');open('me');}
  },true);
  const config=document.createElement('section');config.className='utility-config';
  config.innerHTML='<button class="preview-action" data-grant="off" aria-pressed="true">未授权</button><button class="preview-action" data-grant="on" aria-pressed="false">已授权</button>';
  document.querySelector('.wifi-preview-panel').append(config);
  config.addEventListener('click',event=>{
    const target=event.target.closest('[data-grant]');if(!target)return;
    const granted=target.dataset.grant==='on';
    Object.keys(state.permission).forEach(key=>state.permission[key]=granted);
    Object.keys(state.enabled).forEach(key=>state.enabled[key]=granted);
    config.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',button===target));
    sync();
    if(!page.hidden){if(state.page==='tutorial'&&granted)returnFromTutorial();else render();}
  });
  sync();
})();

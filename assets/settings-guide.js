window.SafeGuardianGuide = {
  mount(container, type) {
    if (type === 'web') {
      container.classList.add('video-tutorial');
      const glyphs = {
        play:'<path d="m9 5 11 7-11 7Z"/>',
        pause:'<path d="M8 5v14M16 5v14"/>',
        sound:'<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
        muted:'<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="m16 9 6 6m0-6-6 6"/>',
        expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
        collapse:'<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>'
      };
      const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name]}</svg>`;
      container.innerHTML = `<div class="guide-video-stage"><div class="guide-player"><video class="guide-video" playsinline preload="metadata" poster="assets/tutorials/safari-settings-poster.jpg" aria-label="Safari settings tutorial with English narration"><source src="assets/tutorials/safari-settings-guide.mp4?v=single-natural-22" type="video/mp4"></video><div class="guide-player-controls"><input class="guide-seek" type="range" min="0" max="22" step="0.1" value="0" aria-label="Video progress"><div class="guide-player-buttons"><button type="button" data-video="play" aria-label="Play tutorial">${svg('play')}</button><span class="guide-video-time">0:00 / 0:22</span><button type="button" data-video="sound" aria-label="Mute narration">${svg('sound')}</button><button type="button" data-video="expand" aria-label="Expand tutorial" aria-expanded="false">${svg('expand')}</button></div></div></div></div><div class="guide-copy"><h2 class="guide-caption">Enable Safari protection</h2><button class="utility-button" data-command="settings">Open Settings</button></div>`;
      const video = container.querySelector('video');
      const page = container.closest('.utility-page');
      const playButton = container.querySelector('[data-video="play"]');
      const soundButton = container.querySelector('[data-video="sound"]');
      const expandButton = container.querySelector('[data-video="expand"]');
      const seek = container.querySelector('.guide-seek');
      const time = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2,'0')}`;
      const sync = () => {
        playButton.innerHTML = svg(video.paused ? 'play' : 'pause');
        playButton.setAttribute('aria-label',video.paused ? 'Play tutorial' : 'Pause tutorial');
        soundButton.innerHTML = svg(video.muted ? 'muted' : 'sound');
        soundButton.setAttribute('aria-label',video.muted ? 'Unmute narration' : 'Mute narration');
        seek.max = Number.isFinite(video.duration) ? video.duration : 22;
        seek.value = video.currentTime;
        container.querySelector('.guide-video-time').textContent = `${time(video.currentTime)} / ${time(Number(seek.max))}`;
      };
      const play = () => { if(video.ended)video.currentTime=0; video.play().catch(sync); };
      playButton.onclick = () => video.paused ? play() : video.pause();
      video.onclick = playButton.onclick;
      soundButton.onclick = () => {video.muted=!video.muted;sync();};
      seek.oninput = () => {video.currentTime=Number(seek.value);sync();};
      const expand = value => {
        page.classList.toggle('video-expanded',value);
        page.querySelector('.utility-heading').inert=value;
        container.querySelector('.guide-copy').inert=value;
        expandButton.innerHTML=svg(value?'collapse':'expand');
        expandButton.setAttribute('aria-label',value?'Minimize tutorial':'Expand tutorial');
        expandButton.setAttribute('aria-expanded',String(value));
      };
      expandButton.onclick = () => expand(!page.classList.contains('video-expanded'));
      const escape = event => {if(event.key==='Escape' && page.classList.contains('video-expanded')){event.preventDefault();expand(false);expandButton.focus();}};
      container.addEventListener('keydown',escape);
      ['play','pause','ended','volumechange','timeupdate','loadedmetadata'].forEach(event=>video.addEventListener(event,sync));
      play();
      const stopWhenHidden = () => { if (document.hidden) video.pause(); };
      document.addEventListener('visibilitychange', stopWhenHidden);
      return () => {
        expand(false);
        document.removeEventListener('visibilitychange', stopWhenHidden);
        container.removeEventListener('keydown',escape);
        video.pause();
        video.removeAttribute('src');
        video.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
        video.load();
      };
    }
    container.classList.remove('video-tutorial');
    const content = {
      web:['Open Settings → Apps','Choose Safari','Tap Extensions','Turn on all SafeGuardian protections'],
      calls:['Open Settings → Apps','Choose Phone','Tap Call Blocking & Identification','Turn on SafeGuardian'],
      sms:['Open Settings → Apps','Choose Messages','Tap Unknown & Spam','Select SafeGuardian'],
      media:['Choose photo access','Select your photos','Confirm your selection','Return to SafeGuardian']
    }[type];
    const positions = {
      web:[[86,90],[86,43],[86,89],[86,22]],
      calls:[[86,92],[86,25],[86,59],[86,21]],
      sms:[[86,94],[86,35],[86,95],[86,40]],
      media:[[50,65],[26,30],[85,8],[50,48]]
    }[type];
    container.innerHTML = `<div class="guide-stage"><div class="guide-screen" role="img" aria-label="iOS settings walkthrough"><div class="guide-frame" style="background-image:url(assets/guide-${type}.png)"></div>${type==='web'?'<div class="guide-switches"><span></span><span></span><span></span></div>':''}<span class="guide-touch" aria-hidden="true"></span></div></div><div class="guide-copy"><div class="guide-progress">${content.map((text,index)=>`<button type="button" aria-label="Step ${index+1}: ${text}" data-step="${index}"></button>`).join('')}</div><h2 class="guide-caption"></h2><button class="utility-button" data-command="settings">Open Settings</button><p class="utility-error" role="status"></p></div>`;
    const frame=container.querySelector('.guide-frame');
    const touch=container.querySelector('.guide-touch');
    const switches=container.querySelector('.guide-switches');
    const dots=[...container.querySelectorAll('[data-step]')];
    const stage=container.querySelector('.guide-stage');
    stage.tabIndex=0;
    stage.setAttribute('aria-label','Tutorial steps');
    let pointerStart=null;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let elapsed=0,paused=reduced,previous=-1,last=performance.now();
    const duration=15000;
    function draw(){
      const step=Math.min(3,Math.floor(elapsed/3000));
      if(step!==previous){
        frame.style.backgroundPosition=`${step%2?100:0}% ${step>1?100:0}%`;
        frame.classList.remove('guide-slide');void frame.offsetWidth;frame.classList.add('guide-slide');
        container.querySelector('.guide-caption').textContent=content[step];
        dots.forEach((dot,index)=>dot.setAttribute('aria-current',index===step?'step':'false'));
        previous=step;
      }
      let [left,top]=positions[step];
      if(switches){
        switches.hidden=step!==3;
        const turn=Math.min(2,Math.floor((elapsed-9000)/1600));
        if(step===3)top=[22,28.8,35.6][Math.max(0,turn)];
        [...switches.children].forEach((toggle,index)=>toggle.classList.toggle('enabled',step===3&&elapsed-9000>index*1600+800));
      }
      touch.style.left=left+'%';touch.style.top=top+'%';touch.classList.toggle('paused',paused);
    }
    function goTo(step) {
      elapsed=Math.max(0,Math.min(3,step))*3000;
      last=performance.now();
      draw();
    }
    dots.forEach(dot=>dot.onclick=()=>goTo(Number(dot.dataset.step)));
    stage.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0)return;
      pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId};
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener('pointerup',event=>{
      if(!pointerStart||pointerStart.id!==event.pointerId)return;
      const horizontal=event.clientX-pointerStart.x;
      const vertical=event.clientY-pointerStart.y;
      pointerStart=null;
      if(Math.abs(horizontal)>=35&&Math.abs(horizontal)>Math.abs(vertical))goTo(previous+(horizontal<0?1:-1));
    });
    stage.addEventListener('pointercancel',()=>{pointerStart=null;});
    stage.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();goTo(previous+(event.key==='ArrowRight'?1:-1));
      }
    });
    draw();
    const timer=setInterval(()=>{const now=performance.now();if(!paused&&!pointerStart&&!document.hidden){elapsed=(elapsed+now-last)%duration;draw();}last=now;},100);
    return ()=>clearInterval(timer);
  }
};

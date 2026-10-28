window.SafeGuardianGuide = {
  mount(container, type) {
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

(() => {
  const reports = {
    auth: {title:'WiFi Authentication', icon:'lock', color:'green', scope:'Wi-Fi authentication', safe:'The reported Wi-Fi connection uses password-based encryption. No authentication issue was found in this check.', risk:'The reported network is open or uses outdated protection. Other people nearby may be able to observe unencrypted traffic.', unavailable:'Unable to verify this network’s authentication.', advice:'Check the network security in your device’s Wi-Fi settings. Prefer WPA2 or WPA3 networks you trust.'},
    dns: {title:'DNS Security', icon:'globe-lock', color:'blue', scope:'DNS resolution', safe:'The tested domain responses matched the expected results. No unusual resolution was found in this check.', risk:'Some responses did not match the expected results. A captive portal, DNS configuration or interception could be responsible; this alone does not prove an attack.', unavailable:'Unable to verify DNS security. Please try again.', advice:'Complete any network sign-in first. If problems persist, try a trusted network and check again.'}
  };
  const detail = document.createElement('section');
  detail.className = 'wifi-detail'; detail.hidden = true;
  detail.setAttribute('aria-label','Wi-Fi analysis');
  testPage.append(detail);
  let current = 'auth';
  let status = 'Unavailable';
  let lastChecked = 'Not checked';
  let timer;
  const previewPanel = document.createElement('aside');
  previewPanel.className = 'wifi-preview-panel';
  previewPanel.setAttribute('aria-label', 'Prototype controls');
  previewPanel.innerHTML = '<h2>模拟</h2><section class="preview-results">'+['Unavailable','Safe','Risk'].map(value=>'<button class="preview-action" data-result="'+value+'" disabled>'+value+'</button>').join('')+'</section>';
  document.body.append(previewPanel);
  const previewButtons = [...previewPanel.querySelectorAll('[data-result]')];
  previewPanel.addEventListener('click', event => {
    const target=event.target.closest('[data-result]');if(!target)return;
    clearTimeout(timer);
    status = target.dataset.result; lastChecked = 'Sample result'; show();
  });
  const shortResults = {
    auth: {Safe:'No authentication issues found in this check.', Risk:'Open or outdated Wi-Fi protection detected.', Unavailable:'Unable to verify Wi-Fi security.'},
    dns: {Safe:'No unusual DNS responses found in this check.', Risk:'Unexpected DNS responses need attention.', Unavailable:'Unable to verify DNS security.'}
  };
  function show() {
    const report = reports[current];
    previewButtons.forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed',button.dataset.result===status);});
    detail.innerHTML = `<div class="analysis-top"><button class="analysis-back" aria-label="Back to WiFi Test"><svg><use href="#arrow"/></svg></button><h1>WiFi Test</h1></div><div class="analysis-body"><section class="analysis-summary"><span class="badge ${report.color}"><span class="asset-icon" style="--icon:url(icons/${report.icon}.svg)" aria-hidden="true"></span></span><h2>${report.title}</h2><span class="analysis-status ${status.toLowerCase()}">${status}</span><p>${shortResults[current][status]}</p></section><section class="network-panel"><div class="network-name"><small>Wi-Fi</small><strong>Name unavailable</strong></div><dl class="network-values"><div><dt>Public IP</dt><dd>Unavailable</dd></div><div><dt>Country / region</dt><dd>Unavailable</dd></div><div><dt>${current === 'auth' ? 'Encryption' : 'DNS resolver'}</dt><dd>Unavailable</dd></div></dl></section><div class="analysis-tip">${current === 'auth' ? 'Use a trusted WPA2 or WPA3 network.' : 'Complete Wi-Fi sign-in, then retry.'}</div><button class="analysis-recheck">Check Again</button></div>`;
    detail.querySelector('.analysis-back').addEventListener('click', close);
    detail.querySelector('.analysis-recheck').addEventListener('click', event => {
      event.target.disabled = true; event.target.textContent = 'Checking…';
      timer = setTimeout(() => { status = 'Unavailable'; lastChecked = 'Could not complete'; show(); }, 700);
    });
  }
  function close() {
    clearTimeout(timer); detail.hidden = true;
    previewButtons.forEach(button=>{button.disabled=true;});
    [...testPage.children].forEach(child => { if (child !== detail) child.inert = false; });
    testPage.classList.remove('analysis-open');
  }
  testPage.querySelectorAll('.wifi-row').forEach((row, index) => {
    row.setAttribute('role','button'); row.tabIndex = 0;
    row.setAttribute('aria-label', `View ${index ? 'DNS Security' : 'WiFi Authentication'} analysis`);
    const chevron = document.createElement('span'); chevron.className = 'analysis-chevron'; chevron.innerHTML = '<svg><use href="#arrow"/></svg>'; row.append(chevron);
    const open = () => {
      current = index ? 'dns' : 'auth'; status = 'Unavailable'; lastChecked = 'Not checked';
      stopSpeedTest(); show(); detail.hidden = false; testPage.classList.add('analysis-open');
      [...testPage.children].forEach(child => { if (child !== detail) child.inert = true; });
      detail.scrollTop = 0; detail.querySelector('.analysis-back').focus();
    };
    row.addEventListener('click', open);
    row.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  document.querySelector('.tabs').addEventListener('click', close);
})();

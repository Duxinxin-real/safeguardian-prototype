(() => {
  const detailIcons = {"auth": "<svg class=\"analysis-feature-icon\" aria-hidden=\"true\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" />\n  <path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />\n</svg>\n", "dns": "<svg class=\"analysis-feature-icon\" aria-hidden=\"true\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M15.686 15A14.5 14.5 0 0 1 12 22a14.5 14.5 0 0 1 0-20 10 10 0 1 0 9.542 13\" />\n  <path d=\"M2 12h8.5\" />\n  <path d=\"M20 6V4a2 2 0 1 0-4 0v2\" />\n  <rect width=\"8\" height=\"5\" x=\"14\" y=\"6\" rx=\"1\" />\n</svg>\n"};
  const reports = {
    auth: {title:'WiFi Authentication', icon:'lock', color:'green', scope:'Wi-Fi authentication', safe:'The reported Wi-Fi connection uses password-based encryption. No authentication issue was found in this check.', risk:'The reported network is open or uses outdated protection. Other people nearby may be able to observe unencrypted traffic.', unavailable:'Unable to verify this network’s authentication.', advice:'Check the network security in your device’s Wi-Fi settings. Prefer WPA2 or WPA3 networks you trust.'},
    dns: {title:'DNS Security', icon:'globe-lock', color:'blue', scope:'DNS resolution', safe:'The tested domain responses matched the expected results. No unusual resolution was found in this check.', risk:'Some responses did not match the expected results. A captive portal, DNS configuration or interception could be responsible; this alone does not prove an attack.', unavailable:'Unable to verify DNS security. Please try again.', advice:'Complete any network sign-in first. If problems persist, try a trusted network and check again.'}
  };
  const detail = document.createElement('section');
  detail.className = 'wifi-detail'; detail.hidden = true;
  detail.setAttribute('aria-label','Wi-Fi analysis');
  testPage.append(detail);
  let current = 'auth';
  let status = 'Safe';
  const results = {auth:'Safe', dns:'Safe'};
  const scenarios = {
    Safe: {name:'Home Wi-Fi', ip:'240e:47f:620:944b:7cf2:a7d5:9ddc:d141', country:'United States', encryption:'WPA3', resolver:'1.1.1.1'},
    Risk: {name:'Cafe Guest', ip:'2001:db8:85a3:8d3:1319:8a2e:370:7348', country:'United States', encryption:'Open (unencrypted)', resolver:'192.168.1.1'},
    Unavailable: {name:'Name unavailable', ip:'Unavailable', country:'Unavailable', encryption:'Unavailable', resolver:'Unavailable'}
  };
  // Prototype fixtures only; these are not measured network addresses.
  const advice = {
    auth:{Safe:'Keep using a trusted, encrypted network.',Risk:'This network is unencrypted. Avoid sending sensitive information.',Unavailable:'Connect to Wi-Fi, then check again.'},
    dns:{Safe:'The tested DNS responses matched the expected results.',Risk:'Unexpected responses were detected. Complete Wi-Fi sign-in or try a trusted network.',Unavailable:'Check your connection and try again.'}
  };
  function syncResults() {
    testPage.querySelectorAll('.wifi-result').forEach((el,i)=>{
      const value=results[i ? 'dns' : 'auth'];
      el.textContent=value; el.classList.remove('pending','safe','risk','unavailable'); el.classList.add(value.toLowerCase());
    });
  }
  testPage.addEventListener('wifi-check-complete', syncResults);
  testPage.addEventListener('wifi-check-stopped', syncResults);
  syncResults();
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
    status = target.dataset.result; results[current] = status; syncResults(); show();
  });
  const shortResults = {
    auth: {Safe:'No authentication issues found in this check.', Risk:'This Wi-Fi network is not encrypted.', Unavailable:'Unable to verify Wi-Fi security.'},
    dns: {Safe:'No unusual DNS responses found in this check.', Risk:'Unexpected DNS responses need attention.', Unavailable:'Unable to verify DNS security.'}
  };
  function compactIP(ip) {
    if (!ip.includes(':') || ip.length <= 24) return ip;
    const groups = ip.split(':');
    return groups.slice(0, 2).join(':') + ':…:' + groups.slice(-2).join(':');
  }
  async function copyIP(ip) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(ip); return; } catch (_) {}
    }
    const field = document.createElement('textarea');
    field.value = ip; field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(field); field.select();
    const copied = document.execCommand('copy'); field.remove();
    if (!copied) throw new Error('Copy failed');
  }
  function show() {
    const report = reports[current];
    const network = scenarios[status];
    previewButtons.forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed',button.dataset.result===status);});
    detail.innerHTML = `<div class="analysis-top"><button class="analysis-back" aria-label="Back to WiFi Test"><svg><use href="#arrow"/></svg></button><h1>Wi-Fi Check</h1></div><div class="analysis-body"><section class="analysis-summary"><span class="badge ${report.color}">${detailIcons[current]}</span><h2>${report.title}</h2><span class="analysis-status ${status.toLowerCase()}">${status}</span><p>${shortResults[current][status]}</p></section><section class="network-panel"><div class="network-name"><small>Wi-Fi</small><strong>${network.name}</strong></div><dl class="network-values"><div><dt>Public IP</dt><dd>${network.ip === 'Unavailable' ? 'Unavailable' : `<button class="network-copy-ip" aria-label="Copy full IP address"><span>${compactIP(network.ip)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/></svg></button><span class="network-copy-feedback" role="status"></span>`}</dd></div><div><dt>Country / region</dt><dd>${network.country}</dd></div><div><dt>${current === 'auth' ? 'Encryption' : 'DNS resolver'}</dt><dd>${current === 'auth' ? network.encryption : network.resolver}</dd></div></dl></section><div class="analysis-tip">${advice[current][status]}</div><button class="analysis-recheck">Check Again</button></div>`;
    detail.querySelector('.network-copy-ip')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      const feedback = detail.querySelector('.network-copy-feedback');
      try { await copyIP(network.ip); feedback.textContent = 'Copied'; }
      catch (_) { feedback.textContent = 'Unable to copy. Try again.'; }
      button.focus();
      setTimeout(() => { feedback.textContent = ''; }, 1800);
    });
    detail.querySelector('.analysis-back').addEventListener('click', close);
    detail.querySelector('.analysis-recheck').addEventListener('click', event => {
      event.target.disabled = true; event.target.textContent = 'Checking…';
      timer = setTimeout(() => { status = results[current]; syncResults(); show(); }, 700);
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
      current = index ? 'dns' : 'auth'; status = results[current];
      stopSpeedTest(); show(); detail.hidden = false; testPage.classList.add('analysis-open');
      [...testPage.children].forEach(child => { if (child !== detail) child.inert = true; });
      detail.scrollTop = 0; detail.querySelector('.analysis-back').focus();
    };
    row.addEventListener('click', open);
    row.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  document.querySelector('.tabs').addEventListener('click', close);
})();

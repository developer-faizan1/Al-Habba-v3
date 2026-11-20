(() => {
  /* =========================================================
     EMAILJS SETTINGS  –  replace with your own values
     (EmailJS dashboard → Account → API keys / Email Services / Email Templates)
     ========================================================= */
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const form   = document.getElementById('cfForm');
  const panels = [...form.querySelectorAll('.cf-panel')];
  const steps  = [...document.querySelectorAll('#cfSteps .cf-step')];
  const fill   = document.getElementById('cfFill');
  const stepper= document.getElementById('cfSteps');
  const prev   = document.getElementById('cfPrev');
  const next   = document.getElementById('cfNext');
  const nextTx = document.getElementById('cfNextTxt');
  const card   = document.getElementById('cfCard');
  const success= document.getElementById('cfSuccess');
  let cur = 0;

  /* entrance animation */
  new IntersectionObserver((e, o) => {
    e.forEach(x => { if (x.isIntersecting) { card.classList.add('is-in'); o.disconnect(); } });
  }, { threshold: .1 }).observe(card);

  /* selects: float label once a value is chosen */
  form.querySelectorAll('select').forEach(s => {
    const f = s.closest('.cf-field');
    const sync = () => f.classList.toggle('has-value', !!s.value);
    s.addEventListener('change', sync); sync();
  });

  /* validation */
  const validators = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    tel:   v => /^[+\d][\d\s\-()]{6,}$/.test(v),
    number:(v, el) => v !== '' && +v >= +(el.min || -Infinity) && +v <= +(el.max || Infinity)
  };
  function validField(el) {
    const wrap = el.closest('.cf-field');
    const v = el.value.trim();
    let ok = true;
    if (el.required && !v) ok = false;
    else if (v && validators[el.type] && !validators[el.type](v, el)) ok = false;
    wrap.classList.toggle('is-error', !ok);
    return ok;
  }
  form.querySelectorAll('input,select,textarea').forEach(el => {
    el.addEventListener('blur',  () => el.closest('.cf-field') && validField(el));
    el.addEventListener('input', () => el.closest('.cf-field')?.classList.remove('is-error'));
  });
  function validPanel(i) {
    let ok = true;
    panels[i].querySelectorAll('input:not([type=file]),select,textarea').forEach(el => { if (!validField(el)) ok = false; });
    return ok;
  }

  /* wrap step numbers so they can animate */
  steps.forEach(s => {
    const dot = s.querySelector('.cf-step__dot');
    if (!dot.querySelector('.cf-step__num')) dot.innerHTML = `<span class="cf-step__num">${dot.textContent.trim()}</span>`;
  });

  /* navigation */
  function setProgress(i) {
    steps.forEach((s, k) => {
      const wasActive = s.classList.contains('is-active');
      const wasDone   = s.classList.contains('is-done');
      const nowActive = k === i, nowDone = k < i;
      // re-trigger the pop animation only when the state really changes
      if ((nowActive && !wasActive) || (nowDone && !wasDone)) {
        const dot = s.querySelector('.cf-step__dot');
        dot.style.animation = 'none'; void dot.offsetWidth; dot.style.animation = '';
      }
      s.classList.toggle('is-active', nowActive);
      s.classList.toggle('is-done', nowDone);
    });
    const off = steps[0].offsetWidth / 2;
    stepper.style.setProperty('--off', off + 'px');
    fill.style.width = ((stepper.clientWidth - off * 2) * (i / (steps.length - 1))) + 'px';
  }
  function go(i, back) {
    panels.forEach(p => p.classList.remove('is-active', 'is-back'));
    panels[i].classList.add('is-active');
    panels[i].classList.toggle('is-back', !!back);
    cur = i;
    setProgress(i);
    prev.hidden = i === 0;
    nextTx.textContent = i === panels.length - 1 ? 'Submit Application' : 'Continue';
    if (i > 0 || back) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.addEventListener('resize', () => setProgress(cur));

  /* submit with EmailJS */
  async function sendApplication() {
    if (!window.emailjs) throw new Error('EmailJS SDK not loaded');
    // sendForm reads every input's `name` attribute → use {{name}}, {{email}}, {{post_applied_for}} ... in your template
    await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
  }

  next.addEventListener('click', async () => {
    if (!validPanel(cur)) return;
    if (cur < panels.length - 1) return go(cur + 1);

    next.classList.add('is-loading');
    try {
      await sendApplication();
      form.style.display = 'none';
      stepper.style.display = 'none';
      success.classList.add('is-active');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('EmailJS error:', err);
      alert('Sorry, something went wrong. Please try again.');
    } finally {
      next.classList.remove('is-loading');
    }
  });
  prev.addEventListener('click', () => cur > 0 && go(cur - 1, true));

  document.getElementById('cfAgain').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change')));
    resetFile();
    success.classList.remove('is-active');
    form.style.display = '';
    stepper.style.display = '';
    go(0, true);
  });

  /* Enter moves forward instead of submitting */
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next.click(); }
  });

  /* CV drop zone */
  const drop = document.getElementById('cfDrop');
  const file = document.getElementById('cv');
  const fTitle = document.getElementById('cfFileTitle');
  const fName  = document.getElementById('cfFileName');
  const fRemove= document.getElementById('cfFileRemove');
  const defaultName = fName.textContent;
  const MAX_MB = 5;
  function resetFile() { file.value = ''; drop.classList.remove('has-file'); fTitle.textContent = 'Upload your CV'; fName.textContent = defaultName; }
  file.addEventListener('change', () => {
    const f = file.files[0];
    if (!f) return resetFile();
    if (f.size > MAX_MB * 1024 * 1024) { alert(`File is larger than ${MAX_MB} MB.`); return resetFile(); }
    drop.classList.add('has-file');
    fTitle.textContent = 'CV attached';
    fName.textContent = `${f.name} · ${(f.size / 1024 / 1024).toFixed(2)} MB`;
  });
  fRemove.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); resetFile(); });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('is-over')));

  /* button ripple */
  document.querySelectorAll('.cf-btn').forEach(b => b.addEventListener('click', e => {
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const d = document.createElement('span');
    d.className = 'cf-ripple';
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(d); setTimeout(() => d.remove(), 600);
  }));

  go(0);
})();
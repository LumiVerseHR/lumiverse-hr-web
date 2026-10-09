// Contact form: posts to /api/contact (contact/server.mjs) and reports back
// in place. The markup comes from tools/pricing-embed.mjs.
(function () {
  const forms = document.querySelectorAll('[data-contact-form]');
  if (!forms.length) return;

  const opened = Date.now();

  function choose(id) {
    forms.forEach((form) => {
      const select = form.elements.package;
      if (select && [...select.options].some((option) => option.value === id)) select.value = id;
    });
  }

  // "Ask about this" on a price card, or ?package= from another page.
  const fromUrl = new URLSearchParams(location.search).get('package');
  if (fromUrl) choose(fromUrl);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-package]');
    if (link) choose(link.dataset.package);
  });

  forms.forEach((form) => {
    const button = form.querySelector('.form-submit');
    const label = button.querySelector('span');
    const idle = label.textContent;
    const status = form.querySelector('.form-status');

    function show(kind, text, email) {
      status.hidden = false;
      status.dataset.kind = kind;
      status.textContent = text;
      if (email) {
        const link = document.createElement('a');
        link.href = `mailto:${email}`;
        link.textContent = email;
        status.append(' ', link, '.');
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form));
      data.elapsed = Date.now() - opened;

      button.disabled = true;
      label.textContent = button.dataset.sending;
      status.hidden = true;
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        show('sent', status.dataset.sent);
      } catch {
        show('error', status.dataset.error, status.dataset.email);
      } finally {
        button.disabled = false;
        label.textContent = idle;
      }
    });
  });
})();

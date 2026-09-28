// Pricing content that lands in more than one place: the price cards, the
// homepage "What We Do" block and the contact form. The pricing page renders
// the same functions, so a card or the form looks the same everywhere, and
// the homepage gets its prices from src/pricing/packages.mjs at build time
// rather than keeping its own copy.
import { groups, packages, priceParts, priceLine } from "../src/pricing/packages.mjs";
import { contactEmail, form, routes } from "../src/pricing/i18n.mjs";

const site = "https://www.lumiverse.hr";

const escape = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Case-study pages exist in both trees under the same slug.
const caseStudy = (slug, lang) => (lang === "hr" ? `/hr/${slug}` : `/${slug}`);

function priceBlock(price, lang, note = "") {
  const p = priceParts(price, lang);
  return `<div class="price-card-price">
              ${p.lead ? `<span class="price-lead">${p.lead}</span>` : ""}
              <span class="price-amount">${escape(p.amount)}</span>
              <span class="price-unit">${p.unit}</span>
            </div>
            ${p.then ? `<p class="price-then">${escape(p.then)}</p>` : ""}
            ${note ? `<p class="price-note">${escape(note)}</p>` : ""}`;
}

// The full card on the pricing page. Its button fills in the form below.
export function priceCard(pkg, lang) {
  const c = pkg[lang];
  const items = c.includes
    .map(
      (item) => `<li class="feature-list-item">
                <span class="feature-list-icon"><i class="fas fa-check"></i></span>
                ${escape(item)}
              </li>`
    )
    .join("\n              ");
  return `<article class="price-card" id="${pkg.id}">
            <div class="price-card-top">
              <div class="bento-icon"><i class="fas ${pkg.icon}"></i></div>
              ${c.tag ? `<span class="project-tag">${escape(c.tag)}</span>` : ""}
            </div>
            <h3 class="price-card-name">${escape(c.name)}</h3>
            <p class="price-card-summary">${escape(c.summary)}</p>
            ${priceBlock(pkg.price, lang, c.priceNote)}
            <ul class="feature-list price-card-list">
              ${items}
            </ul>
            <a class="price-card-proof" href="${caseStudy(pkg.proof, lang)}">
              <i class="fas fa-chart-line" aria-hidden="true"></i>
              <span>${escape(c.proof)}</span>
            </a>
            <a class="btn btn-secondary price-card-cta" href="#contact" data-package="${pkg.id}">${escape(c.cta)}</a>
          </article>`;
}

// The homepage version: the three engagements as cards, the systems as a
// list, every entry linking to its full card on the pricing page.
export function servicesBlock(lang) {
  const pricing = routes[lang].pricing;
  const more = { en: "Details", hr: "Detalji" }[lang];
  const systemsLabel = { en: "Packaged systems", hr: "Gotovi sustavi" }[lang];
  const cards = packages
    .filter((pkg) => pkg.group === "engagement")
    .map((pkg) => {
      const c = pkg[lang];
      return `<a class="bento-card service-card" href="${pricing}#${pkg.id}">
            <div class="bento-icon"><i class="fas ${pkg.icon}"></i></div>
            <h3 class="bento-title">${escape(c.name)}</h3>
            <p class="bento-text">${escape(c.summary)}</p>
            ${priceBlock(pkg.price, lang)}
            <span class="service-card-more">${more} <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
          </a>`;
    })
    .join("\n          ");
  const rows = packages
    .filter((pkg) => pkg.group === "system")
    .map((pkg) => {
      const c = pkg[lang];
      return `<li><a class="system-row" href="${pricing}#${pkg.id}">
              <span class="system-row-icon"><i class="fas ${pkg.icon}"></i></span>
              <span class="system-row-text"><strong>${escape(c.name)}</strong><span>${escape(c.summary)}</span></span>
              <span class="system-row-price">${escape(priceLine(pkg.price, lang))}${c.priceNote ? `<small>${escape(c.priceNote)}</small>` : ""}</span>
            </a></li>`;
    })
    .join("\n            ");
  return `<div class="service-grid">
          ${cards}
        </div>
        <div class="system-list">
          <h3 class="system-list-title">${systemsLabel}</h3>
          <ul>
            ${rows}
          </ul>
        </div>`;
}

// The form. Posts JSON to /api/contact (contact/server.mjs) via contact.js;
// the package list is the same one the pricing page shows.
export function contactForm(lang) {
  const f = form[lang];
  const optgroups = groups
    .map((group) => {
      const options = packages
        .filter((pkg) => pkg.group === group)
        .map((pkg) => `<option value="${pkg.id}">${escape(pkg[lang].name)}</option>`)
        .join("");
      return `<optgroup label="${escape(group === "engagement" ? f.engagements : f.systems)}">${options}</optgroup>`;
    })
    .join("\n              ");
  // data-clarity-mask keeps what people type out of Clarity session replays.
  return `<form class="contact-form" data-contact-form data-clarity-mask="true" action="/api/contact" method="post" novalidate>
            <input type="hidden" name="lang" value="${lang}">
            <div class="form-row">
              <label class="form-field">
                <span class="form-label">${f.name}</span>
                <input type="text" name="name" autocomplete="name" required maxlength="100">
              </label>
              <label class="form-field">
                <span class="form-label">${f.email}</span>
                <input type="email" name="email" autocomplete="email" required maxlength="200">
              </label>
            </div>
            <div class="form-row">
              <label class="form-field">
                <span class="form-label">${f.company} <span class="form-optional">(${f.optional})</span></span>
                <input type="text" name="company" autocomplete="organization" maxlength="150">
              </label>
              <label class="form-field">
                <span class="form-label">${f.interest}</span>
                <select name="package">
                  <option value="">${f.interestAny}</option>
                  ${optgroups}
                  <option value="other">${f.interestOther}</option>
                </select>
              </label>
            </div>
            <label class="form-field">
              <span class="form-label">${f.message}</span>
              <textarea name="message" rows="5" required minlength="10" maxlength="5000" placeholder="${escape(f.messageHint)}"></textarea>
            </label>
            <label class="form-trap" aria-hidden="true">Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
            <button type="submit" class="btn btn-primary form-submit" data-sending="${escape(f.sending)}">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>
              <span>${f.submit}</span>
            </button>
            <p class="form-status" role="status" aria-live="polite" hidden data-sent="${escape(f.sent)}" data-error="${escape(f.error)}" data-email="${contactEmail}"></p>
            <p class="form-privacy">${escape(f.privacy)}</p>
            <noscript><p class="form-status">${f.noscript} <a href="mailto:${contactEmail}">${contactEmail}</a></p></noscript>
          </form>`;
}

const homepages = { "index.html": "en", "hr/index.html": "hr" };
const SERVICES = "<!-- pricing:services -->";
const FORM = "<!-- pricing:contact-form -->";

// Fills the two markers in the homepages; any other page passes through.
export function pricingStrip(page, html) {
  const lang = homepages[page];
  if (!lang) return html;
  return html.replace(SERVICES, servicesBlock(lang)).replace(FORM, contactForm(lang));
}

export function pricingSitemapEntries(xml, lastmod) {
  const entry = (route) => `  <url>
    <loc>${site}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  const block = `\n  <!-- Pricing (generated from src/pricing by the migrate step) -->\n${entry(routes.en.pricing)}${entry(routes.hr.pricing)}`;
  return xml.replace("</urlset>", `${block}</urlset>`);
}

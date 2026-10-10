import {resolveLanguage, translate, formatNumber} from './locales.js';
import {products, money} from './store.js';

let stored;
try { stored = localStorage.getItem('brww-language'); } catch { /* Storage is optional. */ }
export let language = resolveLanguage(new URL(location.href).searchParams.get('lang'), stored);
export const t = (key, values) => translate(language, key, values);
export const number = value => formatNumber(value, language);
export const price = cents => money(cents, language);
export const localizedProduct = product => ({...product, name: t(`product.${product.id}.name`), note: t(`product.${product.id}.note`)});

export function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  document.title = t('site.title');
  document.querySelector('meta[name="description"]').content = t('site.description');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  // Only fixed, authored translations contain markup; user input never passes here.
  for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of document.querySelectorAll('[data-i18n-alt]')) el.alt = t(el.dataset.i18nAlt);
  for (const product of products) {
    const card = document.querySelector(`[data-product="${product.id}"]`);
    const name = t(`product.${product.id}.name`);
    card.querySelector('.price').textContent = price(product.cents);
    card.querySelector('.rating').innerHTML = `${number(Number(product.rating))} <span>★</span>`;
    card.querySelector('.rating').setAttribute('aria-label', t('product.rating', {name, rating: number(Number(product.rating))}));
    card.querySelector('[data-add]').setAttribute('aria-label', t('product.add', {name}));
  }
  const toggle = document.querySelector('[data-language-switch]');
  toggle.lang = language === 'fa' ? 'en' : 'fa';
  toggle.dir = language === 'fa' ? 'ltr' : 'rtl';
}

export function toggleLanguage() {
  language = language === 'fa' ? 'en' : 'fa';
  try { localStorage.setItem('brww-language', language); } catch { /* The URL still keeps the selected language. */ }
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  history.replaceState(null, '', url);
  applyLanguage();
}

applyLanguage();

import test from 'node:test';
import assert from 'node:assert/strict';
import {messages, resolveLanguage, translate, formatNumber} from '../dist/locales.js';
import {money} from '../dist/store.js';

test('both languages cover every message and preserve interpolation values', () => {
  assert.deepEqual(Object.keys(messages.fa).sort(), Object.keys(messages.en).sort());
  for (const [key, english] of Object.entries(messages.en)) {
    assert.ok(messages.fa[key].trim(), `Empty Persian translation: ${key}`);
    const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(messages.fa[key]), placeholders(english), key);
  }
  assert.equal(translate('fa','preferences.greeting',{name:'سجاد'}),'سلام سجاد، خوش اومدی!');
});

test('Persian is the default; explicit links override the saved language', () => {
  assert.equal(resolveLanguage(null,null),'fa');
  assert.equal(resolveLanguage('invalid','invalid'),'fa');
  assert.equal(resolveLanguage(null,'en'),'en');
  assert.equal(resolveLanguage('fa','en'),'fa');
  assert.equal(resolveLanguage('en','fa'),'en');
});

test('Persian numbers and prices retain the original dollar value', () => {
  assert.equal(formatNumber(12,'fa'),'۱۲');
  assert.equal(money(450,'fa'),'۴٫۵۰ دلار');
  assert.equal(money(450,'en'),'$4.50');
  assert.equal(money(450),'$4.50');
});

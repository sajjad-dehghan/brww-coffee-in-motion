import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitiseCart,updateQuantity,cartTotal,cartCount,recommend} from '../dist/store.js';
test('order quantities and currency total stay correct across changes',()=>{let cart=updateQuantity([],'cappuccino',2);cart=updateQuantity(cart,'latte',1);assert.equal(cartCount(cart),3);assert.equal(cartTotal(cart),1400);cart=updateQuantity(cart,'cappuccino',-2);assert.deepEqual(cart,[{id:'latte',quantity:1}]);assert.equal(cartTotal(cart),500);});
test('untrusted browser storage cannot introduce unknown products or invalid quantities',()=>{assert.deepEqual(sanitiseCart([{id:'unknown',quantity:2},{id:'latte',quantity:-2},{id:'mocha',quantity:'3'},null]),[]);assert.deepEqual(sanitiseCart([{id:'latte',quantity:98},{id:'latte',quantity:10}]),[{id:'latte',quantity:99}]);assert.deepEqual(updateQuantity([],'unknown',4),[]);});
test('quiz recommendations resolve to the expected visible product',()=>{assert.equal(recommend(['chocolate','creamy']),'mocha');assert.equal(recommend(['classic','creamy']),'latte');assert.equal(recommend(['classic','balanced']),'cappuccino');});

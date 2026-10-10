export const products = Object.freeze([
  { id: 'cappuccino', name: 'Cappuccino', cents: 450, rating: '4.9', note: 'Balanced espresso, steamed milk and airy foam.', image: 'assets/cappuccino.webp' },
  { id: 'latte', name: 'Latte', cents: 500, rating: '5.0', note: 'Smooth espresso with fresh, creamy milk.', image: 'assets/latte.webp' },
  { id: 'mocha', name: 'Mocha', cents: 500, rating: '4.7', note: 'Espresso, hot milk and premium chocolate.', image: 'assets/mocha.webp' }
]);
export const money = cents => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(cents/100);
export function sanitiseCart(value) {
  if(!Array.isArray(value)) return [];
  return products.flatMap(p => {
    const rows=value.filter(v=>v && v.id===p.id);
    const quantity=rows.reduce((n,v)=>n+(Number.isInteger(v.quantity)?Math.max(0,Math.min(99,v.quantity)):0),0);
    return quantity ? [{id:p.id,quantity:Math.min(99,quantity)}] : [];
  });
}
export function updateQuantity(cart,id,change) {
  if(!products.some(p=>p.id===id)||!Number.isInteger(change)) return sanitiseCart(cart);
  const next=sanitiseCart(cart);const index=next.findIndex(i=>i.id===id);
  if(index<0){if(change>0)next.push({id,quantity:Math.min(99,change)});}
  else{next[index].quantity=Math.max(0,Math.min(99,next[index].quantity+change));if(!next[index].quantity)next.splice(index,1);}
  return sanitiseCart(next);
}
export const cartCount = cart => sanitiseCart(cart).reduce((n,row)=>n+row.quantity,0);
export const cartTotal = cart => sanitiseCart(cart).reduce((n,row)=>n+products.find(p=>p.id===row.id).cents*row.quantity,0);
export function recommend(answers){return answers[0]==='chocolate'?'mocha':answers[1]==='creamy'?'latte':'cappuccino';}

(() => {
  const config = window.MEMENTO;
  const root = document.querySelector('#books');
  const books = [...config.books].sort((a,b) => Number(b.featured)-Number(a.featured) || (a.order ?? 100)-(b.order ?? 100));
  const el = (tag, cls, text) => { const node = document.createElement(tag); if(cls) node.className=cls; if(text) node.textContent=text; return node; };
  // Les événements locaux restent disponibles ; analytics.js gère l'envoi et le consentement.
  const track = (event, book, format=null, extra={}) => window.dispatchEvent(new CustomEvent('memento:analytics', {detail:{event, bookId:book?.id ?? null, format, parameters:{...(book ? {book_id:book.id, book_name:book.title, ...(format ? {book_format:format} : {})} : {}), ...extra}}}));
  const safeUrl = value => { try {const url = new URL(value); return url.protocol==='https:' ? url.href : null;} catch {return null;} };
  let observer;
  const viewedBooks = new Set();
  // Un seul écouteur par type de clic, même après filtrage ou ajout de livres.
  function trackAmazon(event) {
    if (event.defaultPrevented || (event.type==='auxclick' ? event.button!==1 : event.button!==0)) return;
    const link=event.target.closest?.('a[data-book-id]');
    const book=books.find(book=>book.id===link?.dataset.bookId);
    if(!book || !safeUrl(link.href)) return;
    const destination=new URL(link.href);
    if(!/(^|\.)amazon\.(fr|com|co\.uk|de|it|es|ca|co\.jp|com\.au|nl|se|pl|com\.be)$/.test(destination.hostname) && destination.hostname!=='amzn.to') return;
    const format=(book.formats || []).find(format=>safeUrl(format.amazonUrl)===link.href);
    track('amazon_click',book,format?.name || 'Non précisé',{button_location:link.dataset.buttonLocation || 'book_card',destination_url:destination.href});
  }
  document.addEventListener('click',trackAmazon);
  document.addEventListener('auxclick',trackAmazon);
  function render(filter='Tous') {
    observer?.disconnect();
    root.replaceChildren();
    const visible = books.filter(book => filter==='Tous' || (book.category || []).includes(filter));
    for(const [index,book] of visible.entries()) {
      const theme=['rose','sand','teal','ochre'].includes(book.theme)?book.theme:'sand';
      const article=el('article',`book ${theme} ${book.featured?'featured':''}`); article.id=book.id;
      const visual=el('div','book-visual');
      if(book.badge) visual.append(el('span','book-badge',book.badge));
      if(book.image) {const img=el('img','cover'); img.src=book.image; img.alt=`Couverture de ${book.title}`; img.width=600; img.height=900; img.loading=index===0?'eager':'lazy'; visual.append(img);}
      else {const empty=el('div','cover-pending'); empty.append(el('span','eyebrow','MEMENTO'),el('p','',book.title),el('small','','Couverture à découvrir sur Amazon')); visual.append(empty);}
      const content=el('div','book-content');
      content.append(el('p','eyebrow',(book.category || []).join(' · ')),el('h3','',book.title));
      if(book.author) content.append(el('p','author',book.author));
      content.append(el('p','hook',book.subtitle || book.emotionalHook));
      const purchase=el('div','purchase');
      const formats=(book.formats || []).filter(f=>safeUrl(f.amazonUrl));
      const available=book.available!==false;
      let selected=formats[0];
      const url=safeUrl(selected?.amazonUrl || book.amazonUrl);
      const cta=el('a','amazon','Découvrir sur Amazon'); cta.append(el('span','','↗')); cta.target='_blank'; cta.rel='noopener noreferrer'; cta.dataset.bookId=book.id; cta.setAttribute('aria-label',`Découvrir ${book.title} sur Amazon (nouvel onglet)`);
      cta.dataset.buttonLocation='book_card';
      if(url) cta.href=url;
      if(available && formats.length>1) {
        const group=el('div','formats'); group.setAttribute('role','group'); group.setAttribute('aria-label',`Choisir le format de ${book.title}`);
        formats.forEach((format,i)=>{const button=el('button','format',format.name);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{selected=format;cta.href=safeUrl(format.amazonUrl);group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));track('format_selected',book,format.name);});group.append(button);}); purchase.append(group);
      } else if(available) purchase.append(el('p','format-note',formats.length===1?formats[0].name:'Formats à découvrir sur Amazon'));
      if(available && url) purchase.append(cta);
      else purchase.append(el('p','unavailable','Temporairement indisponible'));
      content.append(purchase); article.append(visual,content); root.append(article);
    }
    document.querySelector('#result-count').textContent=`${visible.length} livre${visible.length>1?'s':''}`;
    if('IntersectionObserver' in window) {observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){if(!viewedBooks.has(entry.target.id)){viewedBooks.add(entry.target.id);track('book_view',books.find(b=>b.id===entry.target.id));}observer.unobserve(entry.target);}});},{threshold:.25});root.querySelectorAll('.book').forEach(book=>observer.observe(book));}
  }
  if(books.length >= (config.filterThreshold ?? 5)) {
    const filters=document.querySelector('#filters'); filters.hidden=false;
    ['Tous',...new Set(books.flatMap(b=>b.category || []))].forEach(category=>{const button=el('button','filter',category);button.type='button';button.setAttribute('aria-pressed',String(category==='Tous'));button.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render(category);track('category_selected',null,null,{category});});filters.append(button);});
  }
  const instagram=safeUrl(config.instagramUrl); if(instagram) {const link=document.querySelector('#instagram');link.href=instagram;link.hidden=false;link.target='_blank';link.rel='noopener noreferrer';}
  document.querySelector('#year').textContent=new Date().getFullYear();
  render(); track('page_view');
})();

(() => {
  const config = window.MEMENTO;
  const root = document.querySelector('#books');
  const books = [...config.books].sort((a,b) => Number(b.featured)-Number(a.featured) || (a.order ?? 100)-(b.order ?? 100));
  const el = (tag, cls, text) => { const node = document.createElement(tag); if(cls) node.className=cls; if(text) node.textContent=text; return node; };
  // Aucun cookie, stockage ou envoi de données. Brancher un outil choisi sur cet événement.
  const track = (event, book, format=null) => window.dispatchEvent(new CustomEvent('memento:analytics', {detail:{event, bookId:book?.id ?? null, format}}));
  const safeUrl = value => { try {const url = new URL(value); return url.protocol==='https:' ? url.href : null;} catch {return null;} };
  function render(filter='Tous') {
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
      if(url) cta.href=url;
      if(available && formats.length>1) {
        const group=el('div','formats'); group.setAttribute('role','group'); group.setAttribute('aria-label',`Choisir le format de ${book.title}`);
        formats.forEach((format,i)=>{const button=el('button','format',format.name);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{selected=format;cta.href=safeUrl(format.amazonUrl);group.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));track('format_selected',book,format.name);});group.append(button);}); purchase.append(group);
      } else if(available) purchase.append(el('p','format-note',formats.length===1?formats[0].name:'Formats à découvrir sur Amazon'));
      if(available && url) {purchase.append(cta);cta.addEventListener('click',()=>track('amazon_click',book,selected?.name));}
      else purchase.append(el('p','unavailable','Temporairement indisponible'));
      content.append(purchase); article.append(visual,content); root.append(article);
    }
    document.querySelector('#result-count').textContent=`${visible.length} livre${visible.length>1?'s':''}`;
    if('IntersectionObserver' in window) {const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){track('book_view',books.find(b=>b.id===entry.target.id));observer.unobserve(entry.target);}});},{threshold:.25});root.querySelectorAll('.book').forEach(book=>observer.observe(book));}
  }
  if(books.length >= (config.filterThreshold ?? 5)) {
    const filters=document.querySelector('#filters'); filters.hidden=false;
    ['Tous',...new Set(books.flatMap(b=>b.category || []))].forEach(category=>{const button=el('button','filter',category);button.type='button';button.setAttribute('aria-pressed',String(category==='Tous'));button.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render(category);});filters.append(button);});
  }
  const instagram=safeUrl(config.instagramUrl); if(instagram) {const link=document.querySelector('#instagram');link.href=instagram;link.hidden=false;link.target='_blank';link.rel='noopener noreferrer';}
  document.querySelector('#year').textContent=new Date().getFullYear();
  render(); track('page_view');
})();

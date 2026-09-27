// Source de vérité du catalogue. Ne pas renseigner de format sans confirmation.
window.MEMENTO = {
  instagramUrl: null,
  filterThreshold: 5,
  books: [
    {
      id: 'mon-coeur', title: 'Mon cœur, racontons notre histoire',
      subtitle: 'Une histoire à écrire à deux.', category: ['Couple', 'Souvenirs'], author: null,
      emotionalHook: 'Votre histoire mérite mieux que de rester dans vos souvenirs.',
      description: 'Votre rencontre, vos premiers instants, les grandes étapes et les petits bonheurs. Un livre à compléter à deux pour garder une trace de tout ce qui fait votre histoire.',
      audience: 'Pour vous deux, et tout ce qui vous unit.',
      image: 'mon-coeur.webp', featured: true, badge: null, order: 1, theme: 'rose',
      available: true, collection: null, formats: [{ name: 'Relié', amazonUrl: 'https://www.amazon.fr/dp/B0HJF5LR5H' }], amazonUrl: 'https://www.amazon.fr/dp/B0HJF5LR5H'
    },
    {
      id: 'maman', title: 'Maman, raconte-moi ton histoire',
      subtitle: 'Toute une vie à transmettre.', category: ['Famille', 'Transmission'], author: null,
      emotionalHook: 'Parce qu’un jour, ses souvenirs deviendront les vôtres.',
      description: 'Son enfance, ses rêves, sa jeunesse, les moments qui l’ont façonnée. Un livre guidé pour inviter votre maman à raconter sa vie et transmettre une part précieuse de votre histoire familiale.',
      audience: 'Pour une maman, et toutes les générations à venir.',
      image: 'maman.webp', featured: false, badge: null, order: 2, theme: 'sand',
      available: true, collection: null, formats: [{ name: 'Relié', amazonUrl: 'https://www.amazon.fr/dp/B0HFXSJLCK' }], amazonUrl: 'https://www.amazon.fr/dp/B0HFXSJLCK'
    }
  ]
};

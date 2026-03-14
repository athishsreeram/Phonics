/**
 * materials.js — Dynamic materials loader for Phonics Learning Hub
 * Supports: Default, Animals, Food, Objects, Vehicles
 */

const MaterialsManager = (() => {
  // ── Built-in material packs ────────────────────────────
  const PACKS = {
    default: {
      name: 'Default',
      emoji: '📚',
      description: 'Classic phonics words',
      // CVC words by vowel family
      cvc: {
        a: ['cat','bat','hat','man','van','bag','lap','sat','rat','fan','cap','map','jam','ham','dam'],
        e: ['bed','red','hen','ten','wet','pet','leg','net','set','men','beg','fed','jet','met','peg'],
        i: ['big','pig','six','mix','sit','bit','hit','lid','fit','tip','win','bin','dip','fig','him'],
        o: ['hot','pot','dog','log','fox','box','hop','top','mop','cot','rob','sob','job','cop','lot'],
        u: ['bug','mug','run','sun','cup','pup','bus','cut','nut','fun','bun','gun','mud','dug','rub']
      },
      // Sight words by level
      sightWords: [
        ['the','and','a','to','I','you','it','in','is','of'],
        ['he','she','we','me','be','do','go','no','so','my'],
        ['was','are','has','his','her','for','can','but','not','all'],
        ['they','them','then','when','what','that','this','with','have','from'],
      ],
      // Rhyme families
      rhymes: [
        { family: '-at', words: ['cat','bat','hat','mat','rat','sat','fat','pat'] },
        { family: '-en', words: ['hen','ten','men','pen','den','Ben','Ken','fen'] },
        { family: '-ig', words: ['big','pig','dig','jig','wig','rig','fig','twig'] },
        { family: '-op', words: ['hop','mop','pop','top','cop','shop','drop','stop'] },
        { family: '-un', words: ['run','fun','sun','bun','gun','nun','pun','spun'] },
      ]
    },

    animals: {
      name: 'Animals',
      emoji: '🐾',
      description: 'Learn phonics with animals',
      cvc: {
        a: ['cat','bat','rat','ram','yak','crab','ant','calf'],
        e: ['hen','pet','elk','eel','keg','web','wren','gerbil'],
        i: ['pig','fish','bird','kid','kit','fin','ibis','kiwi'],
        o: ['dog','frog','fox','ox','cod','robin','moth','mole'],
        u: ['bug','pup','cub','gnu','duck','musk','bull','skunk']
      },
      wordSets: [
        { word: 'cat',   emoji: '🐱', fact: 'Cats say meow!' },
        { word: 'dog',   emoji: '🐶', fact: 'Dogs wag their tails!' },
        { word: 'pig',   emoji: '🐷', fact: 'Pigs say oink!' },
        { word: 'hen',   emoji: '🐔', fact: 'Hens lay eggs!' },
        { word: 'fox',   emoji: '🦊', fact: 'Foxes are clever!' },
        { word: 'bug',   emoji: '🐛', fact: 'Bugs have six legs!' },
        { word: 'bat',   emoji: '🦇', fact: 'Bats fly at night!' },
        { word: 'rat',   emoji: '🐀', fact: 'Rats are smart!' },
        { word: 'frog',  emoji: '🐸', fact: 'Frogs jump high!' },
        { word: 'duck',  emoji: '🦆', fact: 'Ducks love water!' },
        { word: 'crab',  emoji: '🦀', fact: 'Crabs walk sideways!' },
        { word: 'fish',  emoji: '🐟', fact: 'Fish breathe underwater!' },
      ],
      sightWords: [
        ['cat','dog','pig','hen','fox','bug','bat','rat'],
        ['frog','duck','crab','fish','bird','bear','wolf','deer'],
        ['jump','swim','fly','run','hop','crawl','climb','dig'],
        ['big','small','fast','slow','loud','soft','wild','tame'],
      ],
      rhymes: [
        { family: '-at', words: ['cat','bat','rat','mat','sat','fat','hat','pat'] },
        { family: '-og', words: ['dog','frog','log','hog','bog','fog','jog','clog'] },
        { family: '-ig', words: ['pig','big','dig','fig','jig','wig','rig','twig'] },
        { family: '-en', words: ['hen','ten','men','pen','den','wren','Ben','glen'] },
        { family: '-ug', words: ['bug','mug','pug','rug','hug','jug','dug','snug'] },
      ]
    },

    food: {
      name: 'Food',
      emoji: '🍎',
      description: 'Phonics with yummy foods',
      cvc: {
        a: ['jam','ham','yam','tan','pan','can','cap','sap'],
        e: ['peg','fed','red','bed','set','jet','net','ten'],
        i: ['dip','sip','fig','mix','bit','fit','tip','zip'],
        o: ['hot','pot','cod','pod','top','hop','pop','lot'],
        u: ['bun','nut','bud','gum','cup','pup','sub','rub']
      },
      wordSets: [
        { word: 'jam',   emoji: '🍓', fact: 'Jam is sweet and sticky!' },
        { word: 'pie',   emoji: '🥧', fact: 'Pie has a crust!' },
        { word: 'egg',   emoji: '🥚', fact: 'Eggs come from hens!' },
        { word: 'bun',   emoji: '🍞', fact: 'Buns are soft!' },
        { word: 'milk',  emoji: '🥛', fact: 'Milk is white!' },
        { word: 'cake',  emoji: '🎂', fact: 'Cake is for birthdays!' },
        { word: 'nuts',  emoji: '🥜', fact: 'Nuts are crunchy!' },
        { word: 'rice',  emoji: '🍚', fact: 'Rice is tiny grains!' },
        { word: 'soup',  emoji: '🍲', fact: 'Soup is warm!' },
        { word: 'corn',  emoji: '🌽', fact: 'Corn is yellow!' },
        { word: 'peas',  emoji: '🫛', fact: 'Peas are small and green!' },
        { word: 'fish',  emoji: '🐟', fact: 'Fish is healthy!' },
      ],
      sightWords: [
        ['eat','cook','bake','mix','pour','stir','cut','wash'],
        ['hot','cold','sweet','sour','salty','crunchy','soft','yummy'],
        ['more','some','all','much','many','few','little','big'],
        ['lunch','dinner','snack','meal','taste','smell','chew','bite'],
      ],
      rhymes: [
        { family: '-am', words: ['jam','ham','yam','clam','slam','tram','gram','spam'] },
        { family: '-un', words: ['bun','run','fun','sun','gun','nun','pun','spun'] },
        { family: '-ot', words: ['hot','pot','dot','lot','got','shot','spot','trot'] },
        { family: '-ip', words: ['dip','sip','tip','zip','chip','drip','flip','grip'] },
        { family: '-ix', words: ['mix','fix','six','stix'] },
      ]
    },

    objects: {
      name: 'Objects',
      emoji: '🎒',
      description: 'Everyday things around us',
      cvc: {
        a: ['bag','cap','map','pan','can','tap','mat','lamp'],
        e: ['bed','pen','net','set','leg','web','bell','desk'],
        i: ['pin','lid','bin','kit','tip','wig','clip','dish'],
        o: ['box','pot','mop','top','rod','cot','lock','sock'],
        u: ['cup','bus','rug','sub','jug','mud','plug','drum']
      },
      wordSets: [
        { word: 'bag',  emoji: '👜', fact: 'Bags carry things!' },
        { word: 'pen',  emoji: '🖊️', fact: 'Pens write words!' },
        { word: 'cup',  emoji: '🥤', fact: 'Cups hold drinks!' },
        { word: 'bed',  emoji: '🛏️', fact: 'Beds are for sleeping!' },
        { word: 'box',  emoji: '📦', fact: 'Boxes have four sides!' },
        { word: 'pot',  emoji: '🍳', fact: 'Pots cook food!' },
        { word: 'map',  emoji: '🗺️', fact: 'Maps show places!' },
        { word: 'cap',  emoji: '🧢', fact: 'Caps go on your head!' },
        { word: 'rug',  emoji: '🪵', fact: 'Rugs cover the floor!' },
        { word: 'drum', emoji: '🥁', fact: 'Drums make music!' },
        { word: 'bell', emoji: '🔔', fact: 'Bells ring!' },
        { word: 'lock', emoji: '🔒', fact: 'Locks keep things safe!' },
      ],
      sightWords: [
        ['put','get','use','take','make','find','look','keep'],
        ['big','small','round','flat','hard','soft','light','heavy'],
        ['mine','yours','ours','theirs','his','her','their','our'],
        ['here','there','where','near','far','inside','outside','on'],
      ],
      rhymes: [
        { family: '-ag', words: ['bag','tag','wag','rag','flag','drag','snag','brag'] },
        { family: '-en', words: ['pen','ten','hen','men','den','Ben','glen','when'] },
        { family: '-up', words: ['cup','pup','sup','up'] },
        { family: '-ox', words: ['box','fox','pox','socks'] },
        { family: '-ug', words: ['rug','bug','mug','jug','hug','tug','dug','plug'] },
      ]
    },

    vehicles: {
      name: 'Vehicles',
      emoji: '🚗',
      description: 'Vroom! Learn with vehicles',
      cvc: {
        a: ['van','cab','tram','car','tank','flat','path','camp'],
        e: ['jet','red','bed','set','deck','trek','vent','step'],
        i: ['ship','rig','tip','dig','sit','bit','zip','drip'],
        o: ['rod','top','cop','lot','cog','hot','spot','stop'],
        u: ['bus','sub','tug','run','fun','mud','dump','truck']
      },
      wordSets: [
        { word: 'van',  emoji: '🚐', fact: 'Vans carry people!' },
        { word: 'bus',  emoji: '🚌', fact: 'Buses have many seats!' },
        { word: 'jet',  emoji: '✈️', fact: 'Jets fly very fast!' },
        { word: 'cab',  emoji: '🚕', fact: 'Cabs take you places!' },
        { word: 'car',  emoji: '🚗', fact: 'Cars drive on roads!' },
        { word: 'ship', emoji: '🚢', fact: 'Ships sail on water!' },
        { word: 'tug',  emoji: '⛵', fact: 'Tugs pull big ships!' },
        { word: 'sub',  emoji: '🤿', fact: 'Subs go underwater!' },
        { word: 'tram', emoji: '🚃', fact: 'Trams run on tracks!' },
        { word: 'bike', emoji: '🚲', fact: 'Bikes have two wheels!' },
        { word: 'tank', emoji: '🛻', fact: 'Tanks are very strong!' },
        { word: 'truck',emoji: '🚚', fact: 'Trucks carry heavy loads!' },
      ],
      sightWords: [
        ['go','stop','fast','slow','drive','ride','fly','sail'],
        ['up','down','left','right','turn','reverse','forward','back'],
        ['road','track','sky','sea','bridge','tunnel','path','lane'],
        ['loud','quiet','big','small','old','new','first','last'],
      ],
      rhymes: [
        { family: '-an', words: ['van','can','ran','tan','man','plan','scan','span'] },
        { family: '-us', words: ['bus','fuss','plus','thus'] },
        { family: '-et', words: ['jet','net','set','met','wet','bet','let','pet'] },
        { family: '-ip', words: ['ship','tip','zip','drip','chip','flip','grip','trip'] },
        { family: '-ug', words: ['tug','bug','mug','jug','hug','dug','plug','shrug'] },
      ]
    }
  };

  // ── State ──────────────────────────────────────────────
  let _current = localStorage.getItem('phonics_material') || 'default';
  if (!PACKS[_current]) _current = 'default';

  // ── Methods ────────────────────────────────────────────

  function getCurrent() {
    return PACKS[_current];
  }

  function getCurrentKey() {
    return _current;
  }

  function getAll() {
    return Object.entries(PACKS).map(([key, pack]) => ({
      key,
      name: pack.name,
      emoji: pack.emoji,
      description: pack.description
    }));
  }

  function set(key) {
    if (!PACKS[key]) return;
    _current = key;
    localStorage.setItem('phonics_material', key);
    document.dispatchEvent(new CustomEvent('materialChanged', { detail: { key, pack: PACKS[key] } }));
  }

  /** Build a <select> element for material switching */
  function createSelector() {
    const wrap = document.createElement('div');
    wrap.className = 'material-selector-wrap';

    const label = document.createElement('span');
    label.textContent = '🎨';
    label.style.fontSize = '1.4rem';

    const select = document.createElement('select');
    select.className = 'material-selector';
    select.setAttribute('aria-label', 'Choose learning material');
    select.setAttribute('title', 'Switch material pack');

    Object.entries(PACKS).forEach(([key, pack]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${pack.emoji} ${pack.name}`;
      if (key === _current) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      set(e.target.value);
      if (window.AudioManager) AudioManager.playTone('click');
    });

    // Listen for external changes
    document.addEventListener('materialChanged', () => {
      select.value = _current;
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
    return wrap;
  }

  return { getCurrent, getCurrentKey, getAll, set, createSelector };
})();

// Auto-insert material selector into .nav-right
document.addEventListener('DOMContentLoaded', () => {
  const navRight = document.querySelector('.nav-right');
  if (navRight) {
    navRight.prepend(MaterialsManager.createSelector());
  }
});

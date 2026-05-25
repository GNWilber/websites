// ============================================================
//  DANE FILMÓW — edytuj tutaj, aby dodać lub usunąć filmy
//  FORMAT DATY: DD.MM.YYYY
// ============================================================

  // {
  //   name: "",
  //   altName: "",
  //   year: ,
  //   filmweb: "",
  //   date: ".2026",
  //   flag: ""
  // },


const ANNOUNCEMENT = "";

const ANNOUNCEMENT_EXPIRY = "15.05.2026";

const MOVIES = [
  {
    name: "Good Fortune",
    altName: "Anioł Stróż",
    year: 2025,
    filmweb: "https://www.filmweb.pl/film/Anio%C5%82+str%C3%B3%C5%BC-2025-10065014",
    date: "28.11.2025",
    flag: "🇺🇸"
  },
  {
    name: "Straume",
    altName: "Flow",
    year: 2024,
    filmweb: "https://www.filmweb.pl/film/Flow-2024-10052360",
    date: "19.12.2025",
    flag: "🇱🇻🇫🇷🇧🇪"
  },
  {
    name: "Hacksaw Ridge",
    altName: "Przełęcz ocalonych",
    year: 2016,
    filmweb: "https://www.filmweb.pl/film/Prze%C5%82%C4%99cz+ocalonych-2016-658802",
    date: "02.01.2026",
    flag: "🇺🇸🇦🇺"
  },
  {
    name: "Lucky",
    altName: "Szczęściarz",
    year: 2017,
    filmweb: "https://www.filmweb.pl/film/Szcz%C4%99%C5%9Bciarz-2017-790376",
    date: "09.01.2026",
    flag: "🇺🇸"
  },
  {
    name: "It's a Wonderful Life",
    altName: "To wspaniałe życie",
    year: 1946,
    filmweb: "https://www.filmweb.pl/film/To+wspania%C5%82e+%C5%BCycie-1946-31793",
    date: "16.01.2026",
    flag: "🇺🇸"
  },
  {
    name: "Ginga Tetsudō no Yoru",
    altName: "Night on the Galactic Railroad",
    year: 1985,
    filmweb: "https://www.filmweb.pl/film/Kenji+Miyazawa%27s+Night+on+the+Galactic+Railroad-1985-169073",
    date: "23.01.2026",
    flag: "🇯🇵"
  },
  {
    name: "Inside Out",
    altName: "W głowie się nie mieści",
    year: 2015,
    filmweb: "https://www.filmweb.pl/film/W+g%C5%82owie+si%C4%99+nie+mie%C5%9Bci-2015-682170",
    date: "30.01.2026",
    flag: "🇺🇸"
  },
  {
    name: "Kanashimi no Beradonna",
    altName: "Belladonna Smutku",
    year: 1973,
    filmweb: "https://www.filmweb.pl/film/Belladonna+smutku-1973-128976",
    date: "13.02.2026",
    flag: "🇯🇵"
  },
  {
    name: "The Last Samurai",
    altName: "Ostatni Samuraj",
    year: 2003,
    filmweb: "https://www.filmweb.pl/film/Ostatni+samuraj-2003-36447",
    date: "20.02.2026",
    flag: "🇺🇸"
  },
  {
    name: "Relatos salvajes",
    altName: "Dzikie historie",
    year: 2014,
    filmweb: "https://www.filmweb.pl/film/Dzikie+historie-2014-689545",
    date: "27.02.2026",
    flag: "🇦🇷🇪🇸"
  },
  {
    name: "Inside Out 2",
    altName: "W głowie się nie mieści 2",
    year: 2024,
    filmweb: "https://www.filmweb.pl/film/W+g%C5%82owie+si%C4%99+nie+mie%C5%9Bci+2-2024-10019716",
    date: "06.03.2026",
    flag: "🇺🇸"
  },
  {
    name: "Fantastic Mr. Fox",
    altName: "Fantastyczny Pan Lis",
    year: 2009,
    filmweb: "https://www.filmweb.pl/film/Fantastyczny+Pan+Lis-2009-156466",
    date: "13.03.2026",
    flag: "🇺🇸🇬🇧"
  },
  {
    name: "Dream Productions",
    altName: "Wytwórnia filmowa Śpioch",
    year: 2024,
    filmweb: "https://www.filmweb.pl/serial/Wytw%C3%B3rnia+filmowa+%C5%9Apioch-2024-10058711",
    date: "20.03.2026",
    flag: "🇺🇸"
  },
  {
    name: "Sennen Joyū",
    altName: "Millennium Actress",
    year: 2001,
    filmweb: "https://www.filmweb.pl/film/Millennium+Actress-2001-104796",
    date: "27.03.2026",
    flag: "🇯🇵"
  },
  {
    name: "Le Locataire",
    altName: "Lokator",
    year: 1976,
    filmweb: "https://www.filmweb.pl/film/Lokator-1976-7194",
    date: "03.04.2026",
    flag: "🇫🇷"
  },
  {
    name: "Druk",
    altName: "Na rauszu",
    year: 2020,
    filmweb: "https://www.filmweb.pl/film/Na+rauszu-2020-838872",
    date: "10.04.2026",
    flag: "🇩🇰"
  },
  {
    name: "Forrest Gump",
    altName: "",
    year: 1994,
    filmweb: "https://www.filmweb.pl/film/Forrest+Gump-1994-998",
    date: "17.04.2026",
    flag: "🇺🇸"
  },
  {
    name: "Penguin's Memory: Shiawase monogatari",
    altName: "",
    year: 1985,
    filmweb: "https://www.filmweb.pl/film/Penguin's+Memory+Shiawase+monogatari-1985-557033",
    date: "24.04.2026",
    flag: "🇯🇵"
  },
  {
    name: "The Big Lebowski",
    altName: "",
    year: 1998,
    filmweb: "https://www.filmweb.pl/film/Big+Lebowski-1998-13",
    date: "01.05.2026",
    flag: "🇺🇸"
  },
  {
    name: "Czeka na nas świat",
    altName: "",
    year: 2006,
    filmweb: "https://www.filmweb.pl/film/Czeka+na+nas+%C5%9Bwiat-2006-113155",
    date: "08.05.2026",
    flag: "🇵🇱"
  },
  {
    name: "Samā Wōzu",
    altName: "Summer Wars",
    year: 2009,
    filmweb: "https://www.filmweb.pl/film/Summer+Wars-2009-507454",
    date: "15.05.2026",
    flag: "🇯🇵"
  },
  {
    name: "Beau Is Afraid",
    altName: "Bo się boi",
    year: 2023,
    filmweb: "https://www.filmweb.pl/film/Bo+si%C4%99+boi-2023-10003754",
    date: "22.05.2026",
    flag: "🇺🇸"
  },
  {
    name: "Дерсу Узала",
    altName: "Dersu Uzała",
    year: 1975,
    filmweb: "https://www.filmweb.pl/film/Dersu+Uza%C5%82a-1975-34074",
    date: "29.05.2026",
    flag: "🇷🇺🇯🇵"
  },
  // {
  //   name: "Az ember tragédiája",
  //   altName: "Tragedia człowieka",
  //   year: 2011,
  //   filmweb: "https://www.filmweb.pl/film/Tragedia+cz%C5%82owieka-2011-643034",
  //   date: "05.06.2026",
  //   flag: "🇭🇺"
  // },
  {
    name: "Arashi no Yoru ni",
    altName: "Stormy Night",
    year: 2005,
    filmweb: "https://www.filmweb.pl/film/Arashi+no+Yoru+ni-2005-215371",
    date: "05.06.2026",
    flag: "🇯🇵"
  },
];

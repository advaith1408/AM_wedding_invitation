/**
 * ============================================================================
 * WEDDING INVITATION CONFIGURATION
 * ============================================================================
 * Edit only the values below (names, dates, venues, images, and music)
 * to customize the entire wedding invitation website!
 * ============================================================================
 */
window.WEDDING_CONFIG = {
  // Set to true to display Bride's name first, false to display Groom's name first
  brideFirst: true,

  // Page & SEO Metadata
  pageTitle: "Manoj Kumar & Arpitha Wedding Invitation",
  invocationText: "|| Shree Ganeshay Namah ||",

  // Background Music (Vybhogam - Srinivasa Kalyanam downloaded locally)
  musicUrl: "assets/audio/song.mp3",

  // Couple Details
  couple: {
    bride: {
      firstName: "Arpitha",
      fullName: "Arpitha Kannayyagari",
      photo: "assets/couple/bride.jpg",
      parentLabel: "Daughter of",
      parents: "Mr. Srinivas Kannayyagari & Mrs. Sandhya Kannayyagari"
    },
    groom: {
      firstName: "Manoj Kumar",
      fullName: "Manoj Kumar Badalgama",
      photo: "assets/couple/groom.jpg",
      parentLabel: "Son of",
      parents: "Mr. Sangameshwar Badalgama & Mrs. Anjali Badalgama"
    },
    sectionHeading: "The Couple",
    sectionSubtitle: "Two families, many blessings, one timeless celebration."
  },

  // Main Wedding Date & Location (Shown on Entry Card, Hero, and Countdown)
  wedding: {
    // ISO format for countdown timer (YYYY-MM-DDTHH:mm:ss)
    countdownTargetIso: "2026-12-31T09:30:00",
    entryDateDisplay: "31 December 2026",
    heroDateDisplay: "Thursday, December 31, 2026",
    venueCity: "LN Convention, Sangareddy"
  },

  // Events Schedule ("The Wedding Journey")
  // Available icon types: "mehendi", "sangeet", "haldi", "pasupu-kotnam", "bonalu-pellikuthuru", "pellikuthuru", "pellikoduku", "wedding", "reception", "engagement", "pooja", "sweets", "other"
  eventsHeading: "The Wedding Journey",
  eventsSubtitle: "Walk with us, function to function, to the sacred hour.",
  events: [
    {
      name: "Haldi",
      type: "haldi",
      date: "Saturday, 5th December 2026",
      time: "Morning",
      venue: "",
      dressCode: "Dress Code: Yellow",
      mapLink: "https://share.google/fSIGIFUPHCLO2qpIC"
    },
    {
      name: "Sangeeth",
      type: "sangeet",
      date: "Saturday, 5th December 2026",
      time: "Evening",
      venue: "",
      dressCode: null,
      mapLink: "https://share.google/fSIGIFUPHCLO2qpIC"
    },
    {
      name: "Pasupu Kotnam",
      type: "pasupu-kotnam",
      date: "Sunday, 27th December 2026",
      time: "",
      venue: "",
      dressCode: null,
      mapLink: "https://share.google/SlZHIQZn9IvENWVkT"
    },
    {
      name: "Mehndi",
      type: "mehendi",
      date: "Sunday, 27th December 2026",
      time: "",
      venue: "",
      dressCode: null,
      mapLink: "https://share.google/SlZHIQZn9IvENWVkT"
    },
    {
      name: "Bonalu & Pelli Kuthuru",
      type: "bonalu-pellikuthuru",
      date: "Tuesday, 29th December 2026",
      time: "",
      venue: "",
      dressCode: null,
      mapLink: "https://share.google/SlZHIQZn9IvENWVkT"
    },
    {
      name: "Wedding",
      type: "wedding",
      date: "Thursday, 31st December 2026",
      time: "9:30 AM",
      venue: "LN Convention, Sangareddy",
      dressCode: "Dress Code: Traditional",
      mapLink: "https://maps.app.goo.gl/x7Qq7A9UpTSiBMts5"
    }
  ],

  // Photo Gallery ("Before the Vows")
  galleryHeading: "Before the Vows",
  gallerySubtitle: "Little moments from the years that brought us here.",
  galleryPhotos: [
    "assets/gallery/photo-1.jpg",
    "assets/gallery/photo-2.jpg",
    "assets/gallery/photo-3.jpg",
    "assets/gallery/photo-4.jpg",
    "assets/gallery/photo-5.jpg",
    "assets/gallery/photo-6.jpg"
  ],

  // RSVP Section
  rsvp: {
    enabled: false
  },

  // Footer
  footer: {
    leadText: "We await your gracious presence",
    mainText: "and your blessings",
    teluguBlessing: "శుభమస్తు",
    showCredit: false
  }
};

/**
 * The per-category design tool.
 *
 * BizSite used to collapse 13 categories into 4 palettes (`FAMILY_STYLE`), so a
 * lawyer and a dentist got a byte-identical site. Each category now carries its
 * own brief instead: which of the nine themes it wears, its accent and hero
 * gradient, the call to action that actually converts for that trade, which
 * sections belong on the page and in what order, and the copy the page falls
 * back to when Google has nothing to say.
 *
 * A brief is the single source for all three outputs: the flat site
 * (`buildSite.js`), the structured data (`seo.js`) and the 3D scaffold
 * (`three/scaffold.js`). Adding a trade means adding one record here.
 *
 * Category ids, accents, gradients, CTAs and WhatsApp openers follow the
 * mercator project's `CATEGORY_CONFIG` and `SCHEMA_TYPE`; the theme mapping,
 * section orders and copy packs are new.
 *
 * Fields:
 *   label          Hebrew name shown in the UI.
 *   searchPhrase   Hebrew plural used for the Places text search.
 *   schemaType     schema.org type for the JSON-LD block.
 *   theme          key into STYLE_THEMES.
 *   accent/grad    hero gradient + accent used when the theme defers to the trade.
 *   cta/wa         button label and prefilled WhatsApp opener.
 *   sections       ordered; a section is still dropped when it has no real data.
 *   heroTreatment  'photo' uses a Google photo, 'gradient' never does.
 *   copy           fallbacks only — real Places data always wins.
 *   three          preset key in three/presets.js.
 */

/** Sections `buildSite` knows how to render, in canonical order. */
export const SECTIONS = ['hero', 'about', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'];

export const DESIGN_BRIEFS = {
  // ---- Food ----------------------------------------------------------------
  restaurant: {
    label: 'מסעדה', searchPhrase: 'מסעדות', schemaType: 'Restaurant',
    theme: 'luxury', accent: '#b45309', grad: 'linear-gradient(135deg,#1c1410,#3b2a1e)',
    cta: 'הזמנת שולחן', wa: 'שלום, ארצה להזמין שולחן אצלכם',
    sections: ['hero', 'about', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'cinematic-plate',
    copy: {
      valueProps: ['מטבח טרי כל יום', 'ישיבה פנימית וחיצונית', 'מתאים לאירועים פרטיים', 'חניה נוחה באזור'],
      services: ['תפריט עונתי מתחלף', 'אירועים פרטיים וקבוצות', 'משלוחים ואיסוף עצמי'],
      about: 'מקום שמארח באמת — אוכל שנעשה במקום, יחס אישי ואווירה שנעים לחזור אליה.',
    },
  },
  cafe: {
    label: 'בית קפה', searchPhrase: 'בתי קפה', schemaType: 'CafeOrCoffeeShop',
    theme: 'nature', accent: '#92400e', grad: 'linear-gradient(135deg,#3f2a1a,#6b4226)',
    cta: 'צפייה בתפריט', wa: 'שלום, ארצה לבדוק זמינות מקום',
    sections: ['hero', 'about', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'warm-grain',
    copy: {
      valueProps: ['קפה בקלייה טרייה', 'מאפים מהמקום', 'פינת עבודה נעימה', 'ישיבה בחוץ'],
      services: ['קפה של בוקר', 'ארוחות קלות ומאפים', 'מקום נוח לעבודה ולפגישות'],
      about: 'בית קפה שכונתי עם קפה טוב, מאפים טריים ומקום נעים לשבת בו שעה או שלוש.',
    },
  },
  bakery: {
    label: 'מאפייה', searchPhrase: 'מאפיות', schemaType: 'Bakery',
    theme: 'creative', accent: '#d97706', grad: 'linear-gradient(135deg,#451a03,#92400e)',
    cta: 'הזמנה מראש', wa: 'שלום, ארצה להזמין מאפים / עוגה',
    sections: ['hero', 'about', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'warm-grain',
    copy: {
      valueProps: ['אפייה טרייה כל בוקר', 'עוגות לאירועים', 'הזמנות מראש', 'חומרי גלם אמיתיים'],
      services: ['לחמים ומאפים יומיים', 'עוגות ליום הולדת ולאירועים', 'מגשי אירוח'],
      about: 'אופים כאן כל בוקר מהתחלה — לחמים, מאפים ועוגות שמוזמנות מראש לכל אירוע.',
    },
  },
  catering: {
    label: 'קייטרינג', searchPhrase: 'קייטרינג', schemaType: 'FoodEstablishment',
    theme: 'luxury', accent: '#b45309', grad: 'linear-gradient(135deg,#1c1410,#78350f)',
    cta: 'קבלת הצעת מחיר', wa: 'שלום, ארצה לקבל הצעת מחיר לאירוע',
    sections: ['hero', 'about', 'services', 'gallery', 'reviews', 'map', 'contact'],
    heroTreatment: 'photo', three: 'cinematic-plate',
    copy: {
      valueProps: ['התאמה אישית לכל אירוע', 'צוות מקצועי במקום', 'כשרות לפי דרישה', 'עמידה בלוחות זמנים'],
      services: ['אירועים פרטיים ומשפחתיים', 'אירועי חברה וכנסים', 'מגשי אירוח ובופה'],
      about: 'קייטרינג שמתפרס לפי האירוע שלכם — תפריט מותאם, צוות במקום ועמידה בזמנים.',
    },
  },
  events: {
    label: 'גן אירועים', searchPhrase: 'גני אירועים', schemaType: 'EventVenue',
    theme: 'premium', accent: '#c2410c', grad: 'linear-gradient(135deg,#1c1410,#7c2d12)',
    cta: 'בדיקת זמינות תאריך', wa: 'שלום, ארצה לבדוק זמינות לתאריך',
    sections: ['hero', 'about', 'gallery', 'services', 'reviews', 'map', 'contact'],
    heroTreatment: 'photo', three: 'cinematic-plate',
    copy: {
      valueProps: ['אולם וגן פתוח', 'הפקה מלאה במקום', 'חניה לאורחים', 'ליווי אישי עד היום עצמו'],
      services: ['חתונות', 'בר / בת מצווה ואירועי משפחה', 'אירועי חברה'],
      about: 'מקום לאירוע שלכם עם ליווי אישי מהסיור הראשון ועד סוף הערב.',
    },
  },

  // ---- Care & beauty -------------------------------------------------------
  barber: {
    label: 'מספרה', searchPhrase: 'מספרות', schemaType: 'HairSalon',
    theme: 'dark', accent: '#e2e8f0', grad: 'linear-gradient(135deg,#0f172a,#1e293b)',
    cta: 'קביעת תור', wa: 'שלום, ארצה לקבוע תור לתספורת',
    sections: ['hero', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'sharp-edge',
    copy: {
      valueProps: ['תספורת מדויקת', 'עיצוב זקן', 'תורים בלי המתנה', 'מוצרי טיפוח מקצועיים'],
      services: ['תספורת גברים', 'עיצוב וגילוח זקן', 'טיפוח וסידור לאירועים'],
      about: 'מספרה שעובדת לפי תור, בלי לחץ ובלי הפתעות — נכנסים, יוצאים מסודרים.',
    },
  },
  beauty: {
    label: 'מכון יופי', searchPhrase: 'מכוני יופי', schemaType: 'BeautySalon',
    theme: 'premium', accent: '#db2777', grad: 'linear-gradient(135deg,#4a1d3a,#7a3b5a)',
    cta: 'קביעת תור', wa: 'שלום, ארצה לקבוע תור לטיפול',
    sections: ['hero', 'services', 'about', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'silk-flow',
    copy: {
      valueProps: ['טיפולים בהתאמה אישית', 'ציוד וחומרים מקצועיים', 'דיסקרטיות ונעימות', 'ייעוץ לפני כל טיפול'],
      services: ['טיפולי פנים', 'מניקור ופדיקור', 'עיצוב גבות וריסים'],
      about: 'מכון שמתחיל כל טיפול בייעוץ — מתאימים את מה שנכון לכם, לא מה שיש בתפריט.',
    },
  },
  spa: {
    label: 'ספא', searchPhrase: 'ספא', schemaType: 'DaySpa',
    theme: 'nature', accent: '#a16207', grad: 'linear-gradient(135deg,#44403c,#78716c)',
    cta: 'הזמנת טיפול', wa: 'שלום, ארצה להזמין טיפול / שובר מתנה',
    sections: ['hero', 'about', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'silk-flow',
    copy: {
      valueProps: ['שקט ופרטיות', 'מטפלים מוסמכים', 'שוברי מתנה', 'חבילות זוגיות'],
      services: ['עיסויים', 'טיפולי גוף ופנים', 'חבילות זוגיות ושוברי מתנה'],
      about: 'שעה או שלוש שהן באמת שלכם — טיפול מקצועי במקום שקט.',
    },
  },
  gym: {
    label: 'מכון כושר', searchPhrase: 'חדרי כושר', schemaType: 'ExerciseGym',
    theme: 'hitech', accent: '#22c55e', grad: 'linear-gradient(135deg,#052e16,#14532d)',
    cta: 'אימון ניסיון חינם', wa: 'שלום, ארצה להגיע לאימון ניסיון',
    sections: ['hero', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'kinetic-grid',
    copy: {
      valueProps: ['ציוד מתקדם', 'מאמנים אישיים', 'שיעורים קבוצתיים', 'שעות פתיחה נוחות'],
      services: ['אימון אישי', 'שיעורים קבוצתיים', 'תוכנית אימונים מותאמת'],
      about: 'מקום להתאמן בו ברצינות — ציוד שעובד, מאמנים שרואים אתכם ותוכנית שמתקדמת.',
    },
  },

  // ---- Medical & professional ---------------------------------------------
  dentist: {
    label: 'מרפאת שיניים', searchPhrase: 'רופאי שיניים', schemaType: 'Dentist',
    theme: 'business', accent: '#0ea5e9', grad: 'linear-gradient(135deg,#0c4a6e,#0369a1)',
    cta: 'קביעת תור', wa: 'שלום, ארצה לקבוע תור לשיניים',
    sections: ['hero', 'services', 'about', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'clinical-depth',
    copy: {
      valueProps: ['ליווי אישי לאורך הטיפול', 'ציוד וטכנולוגיה עדכניים', 'זמינות למקרי חירום', 'הסבר מלא לפני כל טיפול'],
      services: ['בדיקות וניקוי אבנית', 'טיפולי שורש ושתלים', 'אסתטיקה ויישור'],
      about: 'מרפאה שמסבירה כל שלב לפני שמתחילים, ועובדת בקצב שנוח למטופל.',
    },
  },
  clinic: {
    label: 'קליניקה', searchPhrase: 'קליניקות', schemaType: 'MedicalClinic',
    theme: 'minimal', accent: '#3b82f6', grad: 'linear-gradient(135deg,#0f2a6b,#1e40af)',
    cta: 'קביעת תור', wa: 'שלום, ארצה לקבוע תור / ייעוץ',
    sections: ['hero', 'services', 'about', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'clinical-depth',
    copy: {
      valueProps: ['תורים בזמן', 'דיסקרטיות מלאה', 'ליווי אישי', 'מענה טלפוני זמין'],
      services: ['ייעוץ ואבחון', 'מעקב וטיפול מתמשך', 'חוות דעת שנייה'],
      about: 'קליניקה שמקדישה זמן לכל פנייה — אבחון, הסבר ותוכנית טיפול ברורה.',
    },
  },
  vet: {
    label: 'וטרינר', searchPhrase: 'וטרינרים', schemaType: 'VeterinaryCare',
    theme: 'nature', accent: '#14b8a6', grad: 'linear-gradient(135deg,#134e4a,#0f766e)',
    cta: 'קביעת תור', wa: 'שלום, ארצה לקבוע תור לחיה',
    sections: ['hero', 'services', 'about', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'soft-orbit',
    copy: {
      valueProps: ['יחס סבלני לבעל החיים', 'חיסונים ובדיקות שגרתיות', 'זמינות למקרי חירום', 'הסבר ברור לבעלים'],
      services: ['חיסונים ובדיקות', 'טיפול במחלות', 'ניתוחים ומעקב'],
      about: 'מרפאה וטרינרית שמטפלת בחיה בסבלנות ומסבירה לבעלים בדיוק מה קורה.',
    },
  },
  lawyer: {
    label: 'עורך דין', searchPhrase: 'עורכי דין', schemaType: 'LegalService',
    theme: 'premium', accent: '#d4a017', grad: 'linear-gradient(135deg,#1c1917,#3f3f46)',
    cta: 'ייעוץ ראשוני', wa: 'שלום, ארצה לייעוץ ראשוני משפטי',
    sections: ['hero', 'services', 'about', 'reviews', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'weighted-still',
    copy: {
      valueProps: ['ליווי אישי מול הלקוח', 'זמינות ומענה מהיר', 'שקיפות בשכר טרחה', 'ניסיון מוכח בתחום'],
      services: ['ליווי בעסקאות נדל״ן', 'דיני משפחה', 'ייעוץ וייצוג משפטי'],
      about: 'ליווי משפטי אישי — מבינים את התיק לעומק לפני שממליצים על צעד.',
    },
  },
  accountant: {
    label: 'רואה חשבון', searchPhrase: 'רואי חשבון', schemaType: 'AccountingService',
    theme: 'business', accent: '#2563eb', grad: 'linear-gradient(135deg,#1e3a8a,#1e40af)',
    cta: 'ייעוץ ראשוני חינם', wa: 'שלום, ארצה לייעוץ ראשוני',
    sections: ['hero', 'services', 'about', 'reviews', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'weighted-still',
    copy: {
      valueProps: ['ליווי שוטף לאורך השנה', 'דיווח דיגיטלי', 'זמינות לשאלות', 'התאמה לעצמאים ולחברות'],
      services: ['הנהלת חשבונות ושכר', 'דוחות שנתיים ומס', 'ייעוץ עסקי ותכנון מס'],
      about: 'ליווי חשבונאי שוטף לעצמאים ולחברות — לא רק בעונת הדוחות.',
    },
  },
  insurance: {
    label: 'סוכנות ביטוח', searchPhrase: 'סוכנויות ביטוח', schemaType: 'InsuranceAgency',
    theme: 'modern', accent: '#2563eb', grad: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
    cta: 'קבלת הצעת מחיר', wa: 'שלום, ארצה לקבל הצעת מחיר לביטוח',
    sections: ['hero', 'services', 'about', 'reviews', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'weighted-still',
    copy: {
      valueProps: ['השוואת מסלולים', 'ליווי בתביעות', 'מענה אישי', 'בדיקת כפל ביטוחים'],
      services: ['ביטוח רכב ודירה', 'ביטוח בריאות וחיים', 'ביטוח עסקי'],
      about: 'סוכנות שמשווה עבורכם בין המסלולים ומלווה גם ברגע האמת של התביעה.',
    },
  },

  // ---- Trades & retail -----------------------------------------------------
  garage: {
    label: 'מוסך', searchPhrase: 'מוסכים', schemaType: 'AutoRepair',
    theme: 'business', accent: '#3b82f6', grad: 'linear-gradient(135deg,#1e293b,#334155)',
    cta: 'קביעת תור לרכב', wa: 'שלום, ארצה לתאם טיפול לרכב',
    sections: ['hero', 'services', 'about', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'sharp-edge',
    copy: {
      valueProps: ['אבחון לפני תיקון', 'הצעת מחיר מראש', 'חלפים מקוריים', 'אחריות על העבודה'],
      services: ['אבחון ותיקון תקלות', 'טסט וטיפולים תקופתיים', 'מיזוג, בלמים ומתלים'],
      about: 'מוסך שמאבחן לפני שמתקן ומוסר הצעת מחיר לפני שמתחילים בעבודה.',
    },
  },
  driving: {
    label: 'בית ספר לנהיגה', searchPhrase: 'בתי ספר לנהיגה', schemaType: 'DrivingSchool',
    theme: 'modern', accent: '#2563eb', grad: 'linear-gradient(135deg,#0f172a,#334155)',
    cta: 'תיאום שיעור ראשון', wa: 'שלום, ארצה לתאם שיעור נהיגה ראשון',
    sections: ['hero', 'services', 'about', 'reviews', 'map', 'contact'],
    heroTreatment: 'gradient', three: 'kinetic-grid',
    copy: {
      valueProps: ['שיעורים פרטניים', 'ליווי עד המבחן', 'גמישות בשעות', 'סבלנות ומקצועיות'],
      services: ['שיעורי נהיגה', 'הכנה לטסט', 'ריענון לנהגים ותיקים'],
      about: 'ליווי אישי מהשיעור הראשון ועד הרישיון, בקצב שמתאים לתלמיד.',
    },
  },
  flower: {
    label: 'חנות פרחים', searchPhrase: 'חנויות פרחים', schemaType: 'Florist',
    theme: 'nature', accent: '#ec4899', grad: 'linear-gradient(135deg,#831843,#be185d)',
    cta: 'הזמנת זר', wa: 'שלום, ארצה להזמין זר',
    sections: ['hero', 'gallery', 'services', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'soft-orbit',
    copy: {
      valueProps: ['משלוחים באותו יום', 'עיצוב אישי לפי בקשה', 'פרחים טריים', 'זרים לאירועים'],
      services: ['זרים ליום יום ולאירועים', 'עיצוב אירועים', 'משלוחים באזור'],
      about: 'זרים שמורכבים לפי מה שרציתם להגיד — ומגיעים בזמן.',
    },
  },
  jewelry: {
    label: 'תכשיטים', searchPhrase: 'חנויות תכשיטים', schemaType: 'JewelryStore',
    theme: 'luxury', accent: '#d4a017', grad: 'linear-gradient(135deg,#1c1917,#44403c)',
    cta: 'תיאום ייעוץ', wa: 'שלום, ארצה לתאם ייעוץ לתכשיט',
    sections: ['hero', 'gallery', 'about', 'services', 'reviews', 'map', 'contact'],
    heroTreatment: 'photo', three: 'silk-flow',
    copy: {
      valueProps: ['עבודת יד', 'התאמה אישית', 'תעודות ואחריות', 'תיקונים והתאמות במקום'],
      services: ['תכשיטים בהזמנה אישית', 'טבעות אירוסין ונישואין', 'תיקון והתאמת מידה'],
      about: 'תכשיטים שנעשים בהזמנה — נפגשים, מבינים מה רציתם ומייצרים בדיוק את זה.',
    },
  },
  photo: {
    label: 'סטודיו צילום', searchPhrase: 'סטודיו צילום', schemaType: 'PhotographicStudio',
    theme: 'minimal', accent: '#e5e7eb', grad: 'linear-gradient(135deg,#0a0a0a,#262626)',
    cta: 'תיאום צילום', wa: 'שלום, ארצה לתאם צילום / הצעת מחיר',
    sections: ['hero', 'gallery', 'about', 'services', 'reviews', 'map', 'contact'],
    heroTreatment: 'photo', three: 'frame-parallax',
    copy: {
      valueProps: ['סטודיו מאובזר', 'עריכה מקצועית', 'צילומי חוץ ופנים', 'מסירה מהירה'],
      services: ['צילומי משפחה ואירועים', 'צילומי תדמית ומוצר', 'עריכה ואלבומים'],
      about: 'צילום שמרגיש נוח — סטודיו מאובזר, כיוון לאורך הצילום ועריכה שנמסרת בזמן.',
    },
  },
  pet: {
    label: 'חנות חיות', searchPhrase: 'חנויות חיות מחמד', schemaType: 'PetStore',
    theme: 'creative', accent: '#f59e0b', grad: 'linear-gradient(135deg,#431407,#9a3412)',
    cta: 'בירור מלאי', wa: 'שלום, ארצה לבדוק מלאי / לקבל ייעוץ',
    sections: ['hero', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'],
    heroTreatment: 'photo', three: 'soft-orbit',
    copy: {
      valueProps: ['מזון ואביזרים איכותיים', 'ייעוץ מקצועי', 'משלוחים מהירים', 'מגוון למגוון חיות'],
      services: ['מזון ותוספי תזונה', 'אביזרים וכלובים', 'ייעוץ והזמנות מיוחדות'],
      about: 'חנות שיודעת להמליץ — שואלים על החיה שלכם לפני שממליצים על מוצר.',
    },
  },
};

/** Used when a lead arrives with a category BizSite has no brief for. */
export const DEFAULT_BRIEF = {
  label: 'עסק', searchPhrase: 'עסקים', schemaType: 'LocalBusiness',
  theme: 'modern', accent: '#2563eb', grad: 'linear-gradient(135deg,#0f172a,#334155)',
  cta: 'צרו קשר', wa: 'שלום, ארצה לקבל פרטים נוספים',
  sections: ['hero', 'about', 'services', 'gallery', 'reviews', 'hours', 'map', 'contact'],
  heroTreatment: 'photo', three: 'soft-orbit',
  copy: {
    valueProps: ['שירות אישי ומקצועי', 'זמינות ומענה מהיר', 'לקוחות מרוצים וחוזרים', 'מיקום נוח ונגיש'],
    services: ['שירות מקצועי', 'ייעוץ והתאמה אישית', 'זמינות ומענה מהיר'],
    about: 'עסק מקומי שנותן שירות אישי ומקצועי לכל לקוח.',
  },
};

/**
 * Resolve a category id to its brief. Falls back to a two-way substring match
 * on the Hebrew label, the way mercator's buildWebsite does, so a lead whose
 * category came back as "מרפאת שיניים פרטית" still lands on the dentist brief.
 */
export function getBrief(cat) {
  if (!cat) return DEFAULT_BRIEF;
  if (DESIGN_BRIEFS[cat]) return DESIGN_BRIEFS[cat];
  const text = String(cat);
  const byLabel = Object.values(DESIGN_BRIEFS).find(b => text.includes(b.label))
    || Object.values(DESIGN_BRIEFS).find(b => b.label.includes(text));
  return byLabel || DEFAULT_BRIEF;
}

/** `{id: 'Hebrew plural'}`, the shape `places.js` wants for its text searches. */
export const CATEGORY_PHRASES = Object.fromEntries(
  Object.entries(DESIGN_BRIEFS).map(([id, b]) => [id, b.searchPhrase])
);

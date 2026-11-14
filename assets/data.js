/* Trinity Home Care: shared content for the website and the booking app.
   Edit services, areas and contact details here; both pages update together. */
window.THC = {
  phone: "+91 75885 20148",
  phoneRaw: "+917588520148",
  whatsapp: "917588520148",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brooklyn+Housing+Society+Pride+World+City+Charholi+Budruk+Pune",
  reviewUrl: "https://share.google/uLcvdmdj2WxbHHGkf",
  instagramUrl: "https://www.instagram.com/trinityhomecare.in/",

  services: [
    { id: "iv", name: "IV infusion & drip", short: "IV drip", rx: true, featured: true,
      desc: "Bedside cannulation, slow IV antibiotic therapy and drip monitoring at home. The nurse carries a portable IV stand, and an anaphylaxis kit to treat any allergic reaction during the infusion.",
      ready: ["Doctor's prescription with fluid / medicine and rate", "IV fluids and medicines as prescribed", "A bed or chair the patient can rest on for the full drip"] },
    { id: "injection", name: "Injections (IM / IV / SC)", short: "Injection", rx: true,
      desc: "Prescribed injection courses and insulin. Vitals are checked with every injection: BP, SpO2 and pulse, plus random blood sugar (RBS) for diabetic patients. The nurse carries an anaphylaxis kit to treat any allergic reaction during administration.",
      ready: ["Prescription showing dose and frequency", "The injection / vial (kept as per label, e.g. refrigerated)"] },
    { id: "ivf", name: "IVF injections (daily)", short: "IVF injection", rx: true,
      desc: "Daily fertility injections given on time, every day, as per your IVF specialist's schedule.",
      ready: ["IVF specialist's prescription and injection schedule", "The injections, stored as instructed (many need refrigeration)"] },
    { id: "factor8", name: "Factor VIII injection", short: "Factor VIII", rx: true,
      desc: "Specialised doses given strictly under a written prescription.",
      ready: ["Haematologist's written prescription", "Factor VIII vials, stored as instructed"] },
    { id: "dressing", name: "Wound & skin graft dressing", short: "Dressing", rx: true,
      desc: "Single visits or multi-day aseptic packages, with stitch-line inspection. Instruments are autoclave-sterilised at 121 °C (15 psi), with single-use sterile dressing kits.",
      ready: ["Doctor's or surgeon's written dressing advice", "Discharge summary", "Any prescribed ointment or dressing material"] },
    { id: "catheter", name: "Foley catheterisation", short: "Catheter", rx: true,
      desc: "Aseptic insertion, drainage bag care and safe removal.",
      ready: ["Prescription mentioning catheter type / size", "Date of the last catheter change, if any"] },
    { id: "ryles", name: "Ryle's tube insertion & care", short: "Ryle's tube", rx: true,
      desc: "Feeding tube insertion with position verification, plus feeding and care guidance.",
      ready: ["Doctor's advice for Ryle's tube", "Feed / formula as advised"] },
    { id: "suture", name: "Suture & staple removal", short: "Suture removal", rx: true,
      desc: "Gentle removal with autoclave-sterilised instruments (121 °C, 15 psi) and single-use sterile kits.",
      ready: ["Surgeon's written advice for suture / staple removal", "Surgery date and discharge summary"] },
    { id: "vitals", name: "Bedside vitals check", short: "Vitals check", rx: false,
      desc: "BP, pulse, SpO2, temperature and blood sugar (RBS).",
      ready: ["Any earlier readings or reports you want compared"] },
    { id: "elder", name: "Elder health check visit", short: "Elder check", rx: false, featured: true,
      desc: "Complete vitals, a pillbox and medication review, a comfort assessment, and a digital report sent to the family.",
      ready: ["Current medicines and pillbox", "Recent reports or prescriptions", "Family member's WhatsApp number for the report"] },
    { id: "other", name: "Other clinical support", short: "Other", rx: false,
      desc: "Tell the desk what the doctor has advised and we'll confirm if we can help.",
      ready: ["Doctor's note or prescription, if any"] }
  ],

  areas: {
    "Pride World City": ["Brooklyn", "Long Island", "Kingsbury", "Montreal", "Manhattan", "Notting Hill", "Wellington", "Atlantic", "Soho", "Boston"],
    "Nearby societies": ["Goel Ganga Newtown", "Pride Purple Aashiyana", "Bramha Skycity", "Kohinoor Viva Pixel", "Nyati Era", "Nyati Evita", "Choice Goodwill Metropolis", "Choice Goodwill Breeza", "Nivasa Enchante", "Triaa Nesterra", "Belmont Skydale", "Gini Bellina", "Excellaa Panama Park"],
    "Nearby": ["Charholi Budruk", "Porwal Road", "Dhanori", "Lohegaon"]
  },

  slots: [
    { id: "morning", label: "Morning", time: "7 am – 11 am" },
    { id: "afternoon", label: "Afternoon", time: "11 am – 4 pm" },
    { id: "evening", label: "Evening", time: "4 pm – 8 pm" },
    { id: "night", label: "Night", time: "8 pm – 11 pm" }
  ]
};

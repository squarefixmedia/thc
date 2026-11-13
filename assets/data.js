/* Trinity Home Care: shared content for the website and the booking app.
   Edit services, areas and contact details here; both pages update together. */
window.THC = {
  phone: "+91 75885 20148",
  phoneRaw: "+917588520148",
  whatsapp: "917588520148",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brooklyn+Housing+Society+Pride+World+City+Charholi+Budruk+Pune",
  reviewUrl: "https://www.google.com/maps/search/?api=1&query=Trinity+Home+Care+Pride+World+City",
  facebookUrl: "https://www.facebook.com/",

  services: [
    { id: "iv", name: "IV infusion & drip", short: "IV drip", rx: true, featured: true,
      desc: "Bedside cannulation, slow IV antibiotic therapy and drip monitoring at home. A portable IV stand is provided.",
      ready: ["Doctor's prescription with fluid / medicine and rate", "IV fluids and medicines as prescribed", "A bed or chair the patient can rest on for the full drip"] },
    { id: "injection", name: "Injections (IM / IV / SC)", short: "Injection", rx: true,
      desc: "Prescribed injection courses and insulin administration.",
      ready: ["Prescription showing dose and frequency", "The injection / vial (kept as per label, e.g. refrigerated)"] },
    { id: "factor8", name: "Factor VIII injection", short: "Factor VIII", rx: true,
      desc: "Specialised doses given strictly under a written prescription.",
      ready: ["Haematologist's written prescription", "Factor VIII vials, stored as instructed"] },
    { id: "dressing", name: "Wound & skin graft dressing", short: "Dressing", rx: false,
      desc: "Single visits or multi-day aseptic packages, with stitch-line inspection.",
      ready: ["Discharge summary or surgeon's dressing advice", "Any prescribed ointment or dressing material"] },
    { id: "catheter", name: "Foley catheterisation", short: "Catheter", rx: true,
      desc: "Aseptic insertion, drainage bag care and safe removal.",
      ready: ["Prescription mentioning catheter type / size", "Date of the last catheter change, if any"] },
    { id: "ryles", name: "Ryle's tube insertion & care", short: "Ryle's tube", rx: true,
      desc: "Feeding tube insertion with position verification, plus feeding and care guidance.",
      ready: ["Doctor's advice for Ryle's tube", "Feed / formula as advised"] },
    { id: "suture", name: "Suture & staple removal", short: "Suture removal", rx: false,
      desc: "Gentle removal with single-use clinical kits.",
      ready: ["Surgery date and surgeon's removal advice", "Discharge summary"] },
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
    "Pride World City": ["Brooklyn", "Long Island", "Kingsbury", "Montreal", "Manhattan", "Notting Hill", "Wellington", "Atlantic", "Soho"],
    "Nearby": ["Charholi Budruk", "Porwal Road", "Dhanori", "Lohegaon"]
  },

  slots: [
    { id: "morning", label: "Morning", time: "7 am – 11 am" },
    { id: "afternoon", label: "Afternoon", time: "11 am – 4 pm" },
    { id: "evening", label: "Evening", time: "4 pm – 8 pm" },
    { id: "night", label: "Night", time: "8 pm – 11 pm" }
  ]
};

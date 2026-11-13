(function () {
  "use strict";
  var T = window.THC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var icons = { iv: "drop", injection: "syringe", factor8: "syringe", dressing: "band", catheter: "tube", ryles: "tube", suture: "cut", vitals: "gauge", elder: "heart", other: "plus" };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SLOT_END = { morning: 11, afternoon: 16, evening: 20, night: 23 };
  var waLink = function (msg) { return "https://wa.me/" + T.whatsapp + "?text=" + encodeURIComponent(msg); };

  var S = { service: null, date: null, slot: null, repeat: "once", days: 5, pref: "Any", rx: null, cons: "We have them", src: "web" };
  var step = 1, form = $("#f"), next = $("#next");
  var svcById = function (id) { return T.services.filter(function (s) { return s.id === id; })[0]; };
  var iso = function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  var fromIso = function (s) { var p = s.split("-"); return new Date(+p[0], p[1] - 1, +p[2]); };
  var niceDate = function (s) { var d = fromIso(s), t = new Date(); t.setHours(0, 0, 0, 0); var diff = Math.round((d - t) / 864e5);
    return (diff === 0 ? "Today, " : diff === 1 ? "Tomorrow, " : DAYS[d.getDay()] + " ") + d.getDate() + " " + MON[d.getMonth()]; };
  $("#footWa").href = waLink("Hi Trinity Home Care, I'd like to book a nurse visit.");

  /* ---------- Step 1: services ---------- */
  var svcs = $("#svcs");
  T.services.forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "svc"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false"); b.dataset.id = s.id;
    b.innerHTML = '<span class="ic"><svg><use href="#i-' + icons[s.id] + '"/></svg></span><span><b>' + esc(s.name) +
      (s.rx ? '<span class="rx">Rx</span>' : "") + "</b><small>" + esc(s.desc) + '</small></span><span class="rd"></span>';
    svcs.appendChild(b);
  });
  svcs.addEventListener("click", function (e) {
    var b = e.target.closest(".svc"); if (!b) return;
    pickService(b.dataset.id); setTimeout(function () { go(2); }, 260);
  });
  function pickService(id) {
    if (!svcById(id)) return;
    S.service = id;
    $$(".svc", svcs).forEach(function (x) { x.setAttribute("aria-checked", x.dataset.id === id); });
    $("#rxBox").hidden = !svcById(id).rx;
    if (!svcById(id).rx) S.rx = null;
    if (id === "elder" && S.repeat === "once") {} // keep user choice
    update();
  }

  /* ---------- Step 2: date / slot / repeat / preference ---------- */
  var datesEl = $("#dates"), slotsEl = $("#slots");
  function buildDates() {
    var t = new Date(); t.setHours(0, 0, 0, 0); var html = "";
    for (var i = 0; i < 14; i++) {
      var d = new Date(t); d.setDate(t.getDate() + i);
      html += '<button type="button" class="date" role="radio" aria-checked="false" data-v="' + iso(d) + '"><small>' +
        (i === 0 ? "Today" : i === 1 ? "Tmrw" : DAYS[d.getDay()]) + "</small><b>" + d.getDate() + "</b><span>" + MON[d.getMonth()] + "</span></button>";
    }
    var max = new Date(t); max.setDate(t.getDate() + 90);
    html += '<label class="date pick"><span>Other<br>date</span><input type="date" id="otherDate" min="' + iso(t) + '" max="' + iso(max) + '" aria-label="Pick another date"></label>';
    datesEl.innerHTML = html;
  }
  buildDates();
  T.slots.forEach(function (s) {
    var b = document.createElement("button"); b.type = "button"; b.className = "slot"; b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false"); b.dataset.v = s.id; b.innerHTML = "<b>" + s.label + "</b><small>" + s.time + "</small>";
    slotsEl.appendChild(b);
  });
  function pickDate(v) {
    S.date = v;
    var found = false;
    $$(".date[data-v]", datesEl).forEach(function (x) { var on = x.dataset.v === v; if (on) found = true; x.setAttribute("aria-checked", on); });
    var pk = $(".date.pick", datesEl);
    var pl = pk.querySelector("span");
    if (!found && v) { var dd = fromIso(v); pk.setAttribute("aria-checked", "true"); pl.innerHTML = DAYS[dd.getDay()] + "<br><b style='font-size:18px'>" + dd.getDate() + " " + MON[dd.getMonth()] + "</b>"; pk.style.background = "var(--navy)"; pk.style.color = "#fff"; }
    else { pk.setAttribute("aria-checked", "false"); pl.innerHTML = "Other<br>date"; pk.style.background = ""; pk.style.color = ""; }
    // disable past slots today
    var isToday = v === iso(new Date()), h = new Date().getHours();
    $$(".slot", slotsEl).forEach(function (b) {
      var dis = isToday && h >= SLOT_END[b.dataset.v] - 1;
      b.disabled = dis; if (dis && S.slot === b.dataset.v) { S.slot = null; b.setAttribute("aria-checked", "false"); }
    });
    update();
  }
  datesEl.addEventListener("click", function (e) { var b = e.target.closest(".date[data-v]"); if (b) pickDate(b.dataset.v); });
  datesEl.addEventListener("change", function (e) { if (e.target.id === "otherDate" && e.target.value) pickDate(e.target.value); });
  slotsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".slot"); if (!b || b.disabled) return;
    S.slot = b.dataset.v; $$(".slot", slotsEl).forEach(function (x) { x.setAttribute("aria-checked", x === b); }); update();
  });
  function seg(el, key, cb) {
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-v]"); if (!b) return; setSeg(el, key, b.dataset.v); if (cb) cb();
    });
  }
  function setSeg(el, key, v) { S[key] = v; $$("button[data-v]", el).forEach(function (x) { x.setAttribute("aria-checked", x.dataset.v === v); }); update(); }
  function repeatUi() {
    var box = $("#daysBox"); box.hidden = S.repeat === "once";
    $("#daysLbl").textContent = S.repeat === "weekly" ? "Number of weeks" : "Number of days";
    $("#dOut").textContent = S.days;
  }
  seg($("#repeat"), "repeat", repeatUi); seg($("#pref"), "pref"); seg($("#rx"), "rx"); seg($("#cons"), "cons");
  $("#dMinus").onclick = function () { S.days = Math.max(2, S.days - 1); repeatUi(); };
  $("#dPlus").onclick = function () { S.days = Math.min(30, S.days + 1); repeatUi(); };

  /* ---------- Step 3: details ---------- */
  var area = $("#area");
  area.appendChild(new Option("Select your society / area", ""));
  Object.keys(T.areas).forEach(function (g) {
    var og = document.createElement("optgroup"); og.label = g;
    T.areas[g].forEach(function (a) { og.appendChild(new Option(a + (g === "Pride World City" ? " · Pride World City" : ""), a)); });
    area.appendChild(og);
  });
  area.appendChild(new Option("Other (nearby)", "Other"));
  $("#phone").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10); });
  $("#age").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3); });
  form.addEventListener("input", function (e) { var w = e.target.closest(".in"); if (w) w.classList.remove("err"); update(); });
  form.addEventListener("change", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  var val = function (id) { return ($("#" + id).value || "").trim(); };
  function detailsErrors(mark) {
    var bad = [];
    if (!val("area")) bad.push("area");
    if (val("flat").length < 2) bad.push("flat");
    if (val("patient").length < 2) bad.push("patient");
    if (val("name").length < 2) bad.push("name");
    if (!/^[6-9]\d{9}$/.test(val("phone"))) bad.push("phone");
    if (mark) bad.forEach(function (id) { $("#" + id).closest(".in").classList.add("err"); });
    return bad;
  }
  function valid(n) {
    if (n === 1) return !!S.service;
    if (n === 2) return !!(S.date && S.slot);
    if (n === 3) return detailsErrors(false).length === 0 && (!svcById(S.service).rx || !!S.rx);
    return true;
  }

  /* ---------- Review ---------- */
  function freqText() { return S.repeat === "once" ? "One visit" : S.repeat === "daily" ? "Daily for " + S.days + " days" : "Weekly for " + S.days + " weeks"; }
  function slotText() { var s = T.slots.filter(function (x) { return x.id === S.slot; })[0]; return s ? s.label + " (" + s.time + ")" : ""; }
  function addrText() { var a = val("area"); var pwc = T.areas["Pride World City"].indexOf(a) > -1; return val("flat") + ", " + a + (pwc ? ", Pride World City" : "") + ", Pune"; }
  function renderReview() {
    var s = svcById(S.service);
    var rows = [
      [1, "Service", s.name + (s.rx ? ' <span class="rx">Rx</span>' : ""), ""],
      [2, "When", niceDate(S.date) + " · " + slotText(), freqText() + (S.pref !== "Any" ? " · " + S.pref + " nurse preferred" : "")],
      [3, "Patient", esc(val("patient")) + (val("age") ? ", " + esc(val("age")) + " yrs" : ""), esc(addrText())],
      [3, "Contact", esc(val("name")), "+91 " + esc(val("phone"))]
    ];
    var extra = [];
    if (s.rx) extra.push("Prescription: " + S.rx);
    extra.push("Consumables: " + S.cons);
    rows.push([3, "Notes", extra.join(" · "), esc(val("notes"))]);
    $("#summary").innerHTML = rows.map(function (r) {
      return '<div class="r"><div><small>' + r[1] + "</small><b>" + r[2] + "</b>" + (r[3] ? "<span>" + r[3] + "</span>" : "") +
        '</div><button type="button" class="edit" data-go="' + r[0] + '">Edit</button></div>';
    }).join("");
    $("#ready").innerHTML = "<h3>Keep ready for the nurse</h3><ul>" + s.ready.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }
  $("#summary").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go); });

  /* ---------- Navigation ---------- */
  var labels = { 1: "Continue", 2: "Continue", 3: "Review booking", 4: "Confirm booking" };
  function update() {
    if (step > 4) return;
    next.disabled = step === 3 ? false : !valid(step);
    next.firstChild.textContent = labels[step] + " ";
  }
  function go(n, fromPop) {
    if (n === step) return;
    var back = n < step;
    $$(".step").forEach(function (el) { el.classList.remove("active", "back"); });
    var el = $('.step[data-step="' + n + '"]'); el.classList.add("active"); if (back) el.classList.add("back");
    step = n;
    if (n === 4) renderReview();
    $("#backBtn").hidden = n === 1 || n === 5;
    $("#foot").hidden = n === 5;
    $("#progWrap").hidden = n === 5;
    $$(".prog i").forEach(function (b, i) { b.classList.toggle("on", i < n); });
    $("#progTxt").textContent = "Step " + Math.min(n, 4) + " of 4";
    $("#progName").textContent = el.dataset.name || "";
    window.scrollTo(0, 0);
    if (!fromPop) try { history.pushState({ s: n }, "", ""); } catch (e) {}
    update();
  }
  window.addEventListener("popstate", function (e) {
    var n = e.state && e.state.s ? e.state.s : 1;
    if (step === 5) { try { history.pushState({ s: 5 }, "", ""); } catch (x) {} return; }
    go(n, true);
  });
  try { history.replaceState({ s: 1 }, "", ""); } catch (e) {}
  $("#backBtn").onclick = function () { history.back(); };
  next.addEventListener("click", function () {
    if (step === 3) {
      var bad = detailsErrors(true);
      if (svcById(S.service).rx && !S.rx) { $("#rxBox").scrollIntoView({ behavior: "smooth", block: "center" }); $("#rx").style.outline = "2px solid var(--err)"; $("#rx").style.borderRadius = "14px"; setTimeout(function () { $("#rx").style.outline = ""; }, 1600); }
      if (bad.length) { $("#" + bad[0]).focus(); return; }
      if (!valid(3)) return;
    }
    if (step < 4) { if (valid(step)) go(step + 1); return; }
    submit();
  });

  /* ---------- Submit ---------- */
  function payload() {
    var s = svcById(S.service);
    return {
      service: s.name, service_id: s.id, rx_required: !!s.rx, date: S.date, date_text: niceDate(S.date), slot: slotText(),
      frequency: freqText(), nurse_pref: S.pref, area: val("area"), flat: val("flat"), address: addrText(),
      patient: val("patient"), age: val("age"), name: val("name"), phone: "+91" + val("phone"),
      prescription: s.rx ? S.rx : "Not needed", consumables: S.cons, notes: val("notes"), source: S.src,
      website: form.website.value
    };
  }
  function waMessage(p, ref) {
    return "*New booking request · Trinity Home Care*\nRef: " + ref +
      "\nService: " + p.service + "\nWhen: " + p.date_text + ", " + p.slot + "\nFrequency: " + p.frequency +
      (p.nurse_pref !== "Any" ? "\nNurse preference: " + p.nurse_pref : "") +
      "\nPatient: " + p.patient + (p.age ? ", " + p.age + " yrs" : "") + "\nAddress: " + p.address +
      "\nContact: " + p.name + ", " + p.phone + "\nPrescription: " + p.prescription + "\nConsumables: " + p.consumables +
      (p.notes ? "\nNotes: " + p.notes : "") + (p.rx_required ? "\n\n(I'll send the prescription photo here.)" : "");
  }
  function submit() {
    var p = payload();
    store.set("thc_contact", { name: p.name, phone: val("phone"), area: p.area, flat: p.flat, patient: p.patient, age: p.age });
    next.classList.add("busy"); next.disabled = true;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    fetch("../api/book.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || "fail"); done(p, j.ref, true); })
      .catch(function () { done(p, "THC-" + Date.now().toString(36).toUpperCase().slice(-6), false); })
      .then(function () { clearTimeout(timer); next.classList.remove("busy"); });
  }
  function done(p, ref, saved) {
    var wa = waLink(waMessage(p, ref));
    var first = p.name.split(" ")[0];
    $("#done").className = "done" + (saved ? "" : " warn");
    $("#done").innerHTML =
      '<div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
      (saved ? '<path d="M5 12.5l4.5 4.5L19 7.5"/>' : '<path d="M12 7v6M12 17h.01"/>') + "</svg></div>" +
      "<h1>" + (saved ? "Request received, " + esc(first) + "." : "Almost done, " + esc(first) + ".") + "</h1>" +
      '<p class="sub">' + (saved
        ? "The Trinity desk will call or WhatsApp you on +91 " + esc(val("phone")) + " to confirm the nurse and time."
        : "We couldn't reach our server just now. Tap below to send this booking on WhatsApp; it only takes a second.") + "</p>" +
      '<span class="ref">Booking ref: ' + esc(ref) + "</span>" +
      '<div class="btns"><a class="b wa" href="' + wa + '" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>' +
      (saved ? (p.rx_required ? "Send prescription on WhatsApp" : "Get updates on WhatsApp") : "Send booking on WhatsApp") + "</a>" +
      '<a class="b" href="tel:' + T.phoneRaw + '"><svg><use href="#i-phone"/></svg>Call the desk</a>' +
      '<button type="button" class="b ghost" id="again">Book another visit</button></div>' +
      '<div class="ready next"><h3>Before the nurse arrives</h3><ul>' + svcById(S.service).ready.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="install" id="install" hidden><img src="../img/logo-96.png" width="40" height="40" alt=""><div><b>Add Trinity to your home screen</b><span id="instTxt">Book your next visit in two taps.</span></div><button type="button" id="instBtn">Add</button></div>';
    go(5);
    $("#again").onclick = function () { location.href = location.pathname + (S.src === "qr" ? "?src=qr" : ""); };
    showInstall();
  }

  /* ---------- Install (PWA) ---------- */
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  function showInstall() {
    var box = $("#install"); if (!box) return;
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (standalone) return;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (deferred) { box.hidden = false; $("#instBtn").onclick = function () { deferred.prompt(); deferred.userChoice.then(function () { box.hidden = true; }); }; }
    else if (ios) { box.hidden = false; $("#instTxt").textContent = "Tap the Share icon, then “Add to Home Screen”."; $("#instBtn").hidden = true; }
  }
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () { try { navigator.serviceWorker.register("sw.js").catch(function () {}); } catch (e) {} });
  }

  /* ---------- Prefill ---------- */
  var q = new URLSearchParams(location.search);
  var hs = (location.hash || "").replace(/^#/, "");
  if (hs) {
    if (svcById(hs) && !q.get("service")) q.set("service", hs);
    else if (hs === "elder-weekly") { q.set("service", "elder"); q.set("repeat", "weekly"); }
    else if (hs.indexOf("area-") === 0) q.set("area", decodeURIComponent(hs.slice(5)).replace(/-/g, " "));
  }
  if (q.get("src")) S.src = q.get("src").slice(0, 20);
  var saved = store.get("thc_contact");
  if (saved) {
    ["name", "phone", "flat", "patient", "age"].forEach(function (k) { if (saved[k]) $("#" + k).value = saved[k]; });
    if (saved.area) area.value = saved.area;
    var w = $("#welcome"); w.hidden = false;
    w.innerHTML = "<span>Welcome back, <b>" + esc((saved.name || "").split(" ")[0]) + "</b>. Your details are saved on this phone.</span>";
  }
  if (q.get("area")) { area.value = q.get("area"); if (!area.value) area.value = "Other"; }
  var when = q.get("when");
  var today = iso(new Date()), tm = new Date(); tm.setDate(tm.getDate() + 1);
  pickDate(when === "tomorrow" ? iso(tm) : today);
  if ($$(".slot:not(:disabled)", slotsEl).length === 0) pickDate(iso(tm));
  if (q.get("repeat") === "weekly" || q.get("repeat") === "daily") { setSeg($("#repeat"), "repeat", q.get("repeat")); S.days = q.get("repeat") === "weekly" ? 4 : 5; repeatUi(); }
  if (q.get("service") && svcById(q.get("service"))) { pickService(q.get("service")); go(2); }
  update();
})();

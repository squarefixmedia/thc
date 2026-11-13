/* Trinity Home Care · website behaviour + motion.
   All motion is calm and switches off for people who ask their device for reduced motion. */
(function () {
  var T = window.THC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wa = function (msg) { return "https://wa.me/" + T.whatsapp + "?text=" + encodeURIComponent(msg); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // booking-app links: query string on the live site, #hash in the preview
  var book = function (k, v) {
    if (window.THC_PREVIEW) return "book/index.html" + (k === "service" ? "#" + v : "");
    return "book/?" + k + "=" + encodeURIComponent(v);
  };
  var icons = { iv: "drop", injection: "syringe", factor8: "syringe", dressing: "band", catheter: "tube", ryles: "tube", suture: "cut", vitals: "gauge", elder: "heart", other: "plus" };

  // links from config
  $$("[data-href]").forEach(function (a) { a.href = T[a.getAttribute("data-href")] || "#"; });
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.getAttribute("data-wa")); });

  // ---------- services accordion + filter ----------
  var list = $("#svclist");
  T.services.forEach(function (s) {
    var el = document.createElement("div");
    el.className = "svc rv"; el.id = "svc-" + s.id; el.dataset.rx = s.rx ? "rx" : "norx";
    el.innerHTML =
      '<button class="svc-top" aria-expanded="false"><span class="svc-ic"><svg><use href="#i-' + icons[s.id] + '"/></svg></span>' +
      '<span><h3>' + esc(s.name) + (s.rx ? ' <span class="rx">Rx</span>' : "") + '</h3><small>' + esc(s.desc) + '</small></span>' +
      '<span class="plus"><svg><use href="#i-plus"/></svg></span></button>' +
      '<div class="svc-body"><div><div class="svc-in"><h4>Keep ready</h4><ul>' +
      s.ready.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") +
      '</ul><a class="btn btn-teal btn-sm" href="' + book("service", s.id) + '">Book ' + esc(s.short.toLowerCase()) + ' <svg><use href="#i-arrow"/></svg></a></div></div></div>';
    list.appendChild(el);
  });
  function toggle(item, force) {
    var open = force !== undefined ? force : !item.classList.contains("open");
    item.classList.toggle("open", open);
    var b = item.querySelector("button"); if (b) b.setAttribute("aria-expanded", open);
  }
  list.addEventListener("click", function (e) { var b = e.target.closest(".svc-top"); if (b) toggle(b.parentNode); });
  $$("[data-open]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault(); var it = $("#svc-" + a.getAttribute("data-open"));
      $$(".filter button")[0].click();
      toggle(it, true); it.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });
  $(".filter").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$(".filter button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    var f = b.dataset.f;
    $$(".svc", list).forEach(function (s) { s.classList.toggle("hidden", f !== "all" && s.dataset.rx !== f); s.classList.add("in"); });
  });

  // footer procedure links
  $("#fsvc").innerHTML = T.services.filter(function (s) { return s.id !== "other"; })
    .map(function (s) { return '<li><a href="' + book("service", s.id) + '">' + esc(s.name) + "</a></li>"; }).join("");

  // FAQ
  $("#faqlist").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) toggle(b.parentNode); });

  // ---------- areas + quick booking card ----------
  var ag = $("#areaGroups"), qa = $("#qarea");
  Object.keys(T.areas).forEach(function (g) {
    var og = document.createElement("optgroup"); og.label = g;
    var d = document.createElement("div"); d.className = "agroup";
    d.innerHTML = "<b>" + esc(g) + '</b><div class="atags">' + T.areas[g].map(function (a) {
      og.appendChild(new Option(a + (g === "Pride World City" ? ", PWC" : ""), a));
      return '<a href="' + book("area", a) + '">' + esc(a) + "</a>";
    }).join("") + "</div>";
    ag.appendChild(d); qa.appendChild(og);
  });
  qa.appendChild(new Option("Somewhere else nearby", "Other"));

  var quick = ["iv", "injection", "dressing", "elder", "vitals"], chips = $("#qchips"), qs = $("#qservice");
  quick.forEach(function (id, i) {
    var s = T.services.filter(function (x) { return x.id === id; })[0];
    var b = document.createElement("button"); b.type = "button"; b.className = "chip";
    b.textContent = s.short; b.setAttribute("aria-pressed", i === 0); b.dataset.id = id;
    chips.appendChild(b);
  });
  var more = document.createElement("a"); more.className = "chip"; more.href = "#services"; more.textContent = "More +"; more.style.textDecoration = "none";
  chips.appendChild(more);
  function updWa() {
    var s = T.services.filter(function (x) { return x.id === qs.value; })[0];
    var w = $("#qwhen");
    $("#qwa").href = wa("Hi Trinity Home Care, I'd like to book: " + s.name + "\nArea: " + qa.value + "\nWhen: " + w.options[w.selectedIndex].text);
  }
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("button.chip"); if (!b) return;
    $$("button.chip", chips).forEach(function (c) { c.setAttribute("aria-pressed", c === b); });
    qs.value = b.dataset.id; updWa();
  });
  qa.addEventListener("change", updWa); $("#qwhen").addEventListener("change", updWa); updWa();
  if (window.THC_PREVIEW) $("#quick").addEventListener("submit", function (e) { e.preventDefault(); location.href = book("service", qs.value); });

  // ---------- motion ----------
  // split the hero headline into words that rise in one after another
  $$("[data-split]").forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var inner = document.createElement("span"); inner.textContent = t; inner.style.setProperty("--d", (120 + i++ * 70) + "ms");
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
  });
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add("ready"); }); });

  // seamless marquee
  var track = $(".track"); if (track && !reduce) track.innerHTML += track.innerHTML;

  // reveal on scroll (staggered within a group)
  var io;
  if ("IntersectionObserver" in window && !reduce) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sib = el.parentNode ? $$(":scope > .rv", el.parentNode) : [];
        var idx = sib.indexOf(el); el.style.setProperty("--rd", Math.max(0, idx % 4) * 90 + "ms");
        el.classList.add("in"); io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("in"); }); }

  // count-up numbers
  function countUp(el) {
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = null, dur = 1400;
    function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } }); }, { threshold: .6 });
    $$("[data-count]").forEach(function (el) { el.textContent = "0"; co.observe(el); });
  }

  // the Bloom: leaves gather when the section comes into view; hovering a value lights its leaf
  var bloom = $("#bloomBig");
  if (bloom) {
    if (reduce || !("IntersectionObserver" in window)) bloom.classList.add("in");
    else { var bo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { bloom.classList.add("in"); bo.disconnect(); } }, { threshold: .35 }); bo.observe(bloom); }
    $$(".values li").forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        bloom.classList.add("dim");
        $$(".lf", bloom).forEach(function (l) { l.classList.toggle("hi", l.dataset.v === li.dataset.v); });
      });
      li.addEventListener("click", function () {
        bloom.classList.add("dim");
        $$(".lf", bloom).forEach(function (l) { l.classList.toggle("hi", l.dataset.v === li.dataset.v); });
      });
      li.addEventListener("mouseleave", function () { bloom.classList.remove("dim"); });
    });
  }

  // how it works: on phones each step gets its own copy of the visual
  var steps = $$(".hs"), views = $$(".hv", $("#howStage"));
  steps.forEach(function (s, i) { var m = document.createElement("div"); m.className = "vis-m"; m.appendChild(views[i].cloneNode(true)); m.firstChild.classList.add("on"); s.appendChild(m); });

  // ---------- one scroll loop for header, hero, parallax and pinned steps ----------
  var hdr = $("header.site"), mbar = $("#mbar"), hero = $("#heroMedia"), pin = $("#howPin"), bar = $("#howBar");
  var para = $$("[data-speed]"), lastY = window.scrollY, cur = -1, ticking = false;
  var desktop = window.matchMedia("(min-width: 901px)");
  function setStep(n) {
    if (n === cur) return; cur = n;
    steps.forEach(function (s, i) { s.classList.toggle("on", i === n); });
    views.forEach(function (v, i) { v.classList.toggle("on", i === n); v.classList.toggle("past", i < n); });
  }
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    hdr.classList.toggle("scrolled", y > 10);
    hdr.classList.toggle("hide", y > 400 && y > lastY + 2);
    if (y < lastY - 2) hdr.classList.remove("hide");
    lastY = y;
    mbar.classList.toggle("show", y > 600);
    if (reduce) return;
    // hero picture opens up as you scroll into it
    var r = hero.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .9)));
    hero.style.setProperty("--p", p.toFixed(3));
    // gentle parallax
    para.forEach(function (el) {
      var b = el.getBoundingClientRect(), c = b.top + b.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (c * parseFloat(el.dataset.speed)).toFixed(1) + "px,0)";
    });
    // pinned steps
    if (desktop.matches) {
      var pr = pin.getBoundingClientRect(), total = pr.height - vh;
      var q = Math.min(1, Math.max(0, -pr.top / total));
      bar.style.width = (q * 100).toFixed(2) + "%";
      setStep(Math.min(steps.length - 1, Math.floor(q * steps.length)));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();
  if (reduce && desktop.matches) {
    // without motion, the step list still follows the scroll
    window.addEventListener("scroll", function () {
      var pr = pin.getBoundingClientRect(), q = Math.min(1, Math.max(0, -pr.top / (pr.height - innerHeight)));
      setStep(Math.min(steps.length - 1, Math.floor(q * steps.length)));
    }, { passive: true });
  }
  // clicking a step jumps to it
  steps.forEach(function (s, i) {
    s.addEventListener("click", function () {
      if (!desktop.matches) return;
      var top = pin.getBoundingClientRect().top + window.scrollY, total = pin.offsetHeight - innerHeight;
      window.scrollTo({ top: top + total * (i + .5) / steps.length, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();

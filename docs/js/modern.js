/* Constra – modern motion layer (vanilla JS, no dependencies) */
(function () {
    "use strict";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* ---------- preloader markup ---------- */
    var spinner = $("#spinner");
    if (spinner) {
        spinner.innerHTML =
            '<div class="loader"><div class="loader-city"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
            '<div class="loader-word">CONSTRA</div><div class="loader-bar"><b></b></div></div>';
    }

    /* ---------- scroll progress + navbar state ---------- */
    var bar = document.createElement("div");
    bar.id = "scroll-progress";
    document.body.appendChild(bar);
    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var h = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
            var nav = $(".sticky-top .navbar");
            if (nav) { nav.style.paddingTop = nav.style.paddingBottom = window.scrollY > 120 ? "8px" : ""; }
            ticking = false;
        });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- custom cursor ---------- */
    if (finePointer && !reduce) {
        var dot = document.createElement("div"), ring = document.createElement("div");
        dot.className = "cursor-dot"; ring.className = "cursor-ring";
        document.body.appendChild(dot); document.body.appendChild(ring);
        var mx = 0, my = 0, rx = 0, ry = 0;
        window.addEventListener("mousemove", function (e) {
            mx = e.clientX; my = e.clientY;
            document.body.classList.add("has-cursor");
            dot.style.transform = "translate(" + mx + "px," + my + "px)";
        }, { passive: true });
        (function loop() {
            rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
            ring.style.transform = "translate(" + rx + "px," + ry + "px)";
            requestAnimationFrame(loop);
        })();
        document.addEventListener("mouseover", function (e) {
            ring.classList.toggle("is-hover", !!e.target.closest("a, button, .service-item, .blog-item, .feature-item"));
        });
    }

    /* ---------- reveal hero: blueprint -> build -> handover ---------- */
    var hero = $("#revealHero");
    if (hero) {
        var sticky = $(".rh-sticky", hero);
        var L2 = $(".rh-l2", hero), L3 = $(".rh-l3", hero);
        var imgs = $$(".rh-img", hero);
        var laser = $(".rh-laser", hero), tagNum = $(".tag i", laser);
        var chapters = $$(".rh-ch", hero);
        var badges = $$(".rh-badge", hero);
        var rail = $(".rh-rail", hero), railFill = $(".fill", rail), railNodes = $$(".n", rail);
        railNodes.forEach(function (n) { n.style.setProperty("--at", n.dataset.at); });
        var cv = $(".rh-sparks", hero), ctx = cv.getContext("2d");

        // ready: start the intro once the preloader is gone
        var startIntro = function () { hero.classList.add("is-ready"); };
        if (spinner && spinner.classList.contains("show") && "MutationObserver" in window) {
            var mo = new MutationObserver(function () {
                if (!spinner.classList.contains("show")) { mo.disconnect(); setTimeout(startIntro, 250); }
            });
            mo.observe(spinner, { attributes: true, attributeFilter: ["class"] });
            setTimeout(function () { mo.disconnect(); startIntro(); }, 3500);
        } else { startIntro(); }

        var vw = 0, vh = 0, off = 0, heroTop = 0, heroH = 0, mouseX = 0, mouseY = 0, mx = 0, my = 0;
        var W = 0, H = 0, FOCUS = 0.66; // horizontal centre of the building inside the 16:9 art

        function layout() {
            vw = window.innerWidth; vh = window.innerHeight;
            // one shared "cover" stage at 16:9 so all layers + badges stay perfectly registered
            var sw = Math.max(vw, vh * 16 / 9), sh = sw * 9 / 16;
            var sx = Math.min(0, Math.max(vw - sw, vw / 2 - FOCUS * sw)), sy = (vh - sh) / 2;
            hero.style.setProperty("--sx", sx + "px"); hero.style.setProperty("--sy", sy + "px");
            hero.style.setProperty("--sw", sw + "px"); hero.style.setProperty("--sh", sh + "px");
            off = Math.tan(8 * Math.PI / 180) * vh / 2;
            var r = hero.getBoundingClientRect();
            heroTop = r.top + window.scrollY; heroH = hero.offsetHeight;
            W = cv.width = vw; H = cv.height = vh;
        }
        layout();
        window.addEventListener("resize", layout);
        window.addEventListener("load", layout);

        var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
        var smooth = function (t) { return t * t * (3 - 2 * t); };

        var target = 0, cur = 0, last = -1, lastX = 0, sparks = [];

        function readTarget() {
            var span = heroH - vh;
            // last 10% of the pin is a dwell: the finished view holds before the page moves on
            target = span > 0 ? clamp((window.scrollY - heroTop) / (span * 0.9), 0, 1) : 1;
        }

        function render(p) {
            // two sweeps: 0..0.5 construction wipes in left->right, 0.5..1 finished wipes in right->left
            var q1 = clamp(p / 0.5, 0, 1), q2 = clamp((p - 0.5) / 0.5, 0, 1);
            var x1 = q1 * (vw + 2 * off) - off;           // front of stage 2 (grows from the left)
            var x2 = vw + off - q2 * (vw + 2 * off);      // front of stage 3 (grows from the right)
            L2.style.clipPath = q1 >= 1 ? "none" : "polygon(0 0," + (x1 + off) + "px 0," + (x1 - off) + "px 100%,0 100%)";
            L3.style.clipPath = q2 <= 0 ? "polygon(100% 0,100% 0,100% 100%,100% 100%)"
                : q2 >= 1 ? "none" : "polygon(" + (x2 + off) + "px 0,100% 0,100% 100%," + (x2 - off) + "px 100%)";

            // laser rides whichever front is active
            var toLeft = p >= 0.5, lx = toLeft ? x2 : x1;
            var live = p > 0.004 && p < 0.996;
            var edge = Math.min(lx + off, vw + off - lx);   // fade out near the screen edges (incl. the 50% hand-off)
            laser.style.opacity = live ? smooth(clamp(edge / 160, 0, 1)) : 0;
            laser.style.transform = "translate3d(" + lx.toFixed(1) + "px,0,0)";
            laser.classList.toggle("to-left", toLeft);
            laser.classList.toggle("tag-l", toLeft ? lx >= 260 : vw - lx < 260);   // keep the tag on-screen
            var pct = Math.round(p * 100);
            tagNum.textContent = (pct < 10 ? "00" : pct < 100 ? "0" : "") + pct + "%";

            // settle the photos as they are revealed + mouse parallax
            var s2 = 1.07 - 0.07 * q1, s3 = 1.09 - 0.09 * q2;
            var px = mx * 14, py = my * 8;
            imgs[0].style.transform = "translate3d(" + (px * .4) + "px," + (py * .4) + "px,0) scale(1.02)";
            imgs[1].style.transform = "translate3d(" + (px * .7) + "px," + (py * .7) + "px,0) scale(" + s2 + ")";
            imgs[2].style.transform = "translate3d(" + px + "px," + py + "px,0) scale(" + s3 + ")";

            // chapters cross-fade
            var f = 0.045;
            chapters.forEach(function (c, i) {
                var a = parseFloat(c.dataset.a), b = parseFloat(c.dataset.b);
                var inn = i === 0 ? 1 : smooth(clamp((p - a) / f, 0, 1));
                var out = smooth(clamp((b - p) / f, 0, 1));
                var o = Math.min(inn, out);
                c.style.opacity = o;
                c.style.transform = "translateY(" + (-46 + (1 - inn) * 6 - (1 - out) * 6) + "%)";
                c.classList.toggle("is-on", o > 0.01);
                c.classList.toggle("is-active", o > 0.6);
            });

            // rail + badges
            railFill.style.transform = "scaleY(" + p + ")";
            var cur3 = p < 0.33 ? 0 : p < 0.69 ? 1 : 2;
            railNodes.forEach(function (n, i) { n.classList.toggle("on", i <= cur3); n.classList.toggle("cur", i === cur3); });
            var showBadges = p > 0.9;
            badges.forEach(function (b) { b.classList.toggle("show", showBadges); });

            // sparks fly off the laser while it moves
            var speed = Math.abs(lx - lastX); lastX = lx;
            if (live && !reduce && speed > 0.6) {
                var n = Math.min(6, 1 + (speed / 8 | 0));
                for (var k = 0; k < n; k++) {
                    sparks.push({ x: lx + (Math.random() - .5) * 10, y: Math.random() * vh,
                        vx: (toLeft ? 1 : -1) * (Math.random() * 3 + 1) + (Math.random() - .5) * 2, vy: Math.random() * -2.2 - .4,
                        life: 1, r: Math.random() * 2 + .8 });
                }
                if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
            }
        }

        function drawSparks() {
            ctx.clearRect(0, 0, W, H);
            for (var i = sparks.length - 1; i >= 0; i--) {
                var s = sparks[i];
                s.x += s.vx; s.y += s.vy; s.vy += 0.07; s.life -= 0.022;
                if (s.life <= 0) { sparks.splice(i, 1); continue; }
                ctx.beginPath();
                ctx.fillStyle = "rgba(255," + (150 + (s.life * 90 | 0)) + "," + (60 + (s.life * 120 | 0)) + "," + s.life + ")";
                ctx.shadowColor = "rgba(255,120,40,.9)"; ctx.shadowBlur = 8;
                ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
            }
            ctx.shadowBlur = 0;
        }

        if (reduce) {
            hero.classList.add("is-static", "is-ready");
        } else {
            window.addEventListener("scroll", readTarget, { passive: true });
            if (finePointer) {
                window.addEventListener("mousemove", function (e) {
                    mouseX = e.clientX / window.innerWidth - .5; mouseY = e.clientY / window.innerHeight - .5;
                }, { passive: true });
            }
            readTarget(); cur = target;
            (function loop() {
                mx += (mouseX - mx) * 0.06; my += (mouseY - my) * 0.06;
                cur += (target - cur) * 0.12;             // smooth scrubbing
                if (Math.abs(target - cur) < 0.0004) cur = target;
                render(cur);
                drawSparks();
                requestAnimationFrame(loop);
            })();
        }
    }

    /* ---------- count-up numbers ---------- */
    function countUp(el) {
        var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", dur = 2000, t0 = null;
        function step(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
            el.innerHTML = Math.floor(end * e).toLocaleString() + (suf ? "<em>" + suf + "</em>" : "");
            if (p < 1) requestAnimationFrame(step);
        }
        reduce ? (el.innerHTML = end.toLocaleString() + (suf ? "<em>" + suf + "</em>" : "")) : requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
        var co = new IntersectionObserver(function (en) {
            en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); co.unobserve(x.target); } });
        }, { threshold: .6 });
        $$("[data-count]").forEach(function (n) { co.observe(n); });

        /* generic reveal for elements tagged .reveal */
        var ro = new IntersectionObserver(function (en) {
            en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); ro.unobserve(x.target); } });
        }, { threshold: .15 });
        $$(".reveal").forEach(function (n, i) { n.style.setProperty("--d", (n.dataset.d || 0) + "s"); ro.observe(n); });
    } else {
        $$("[data-count]").forEach(countUp);
        $$(".reveal").forEach(function (n) { n.classList.add("in"); });
    }

    /* ---------- 3D tilt + glare ---------- */
    if (finePointer && !reduce) {
        $$(".feature-item, .service-item, .blog-item").forEach(function (card) {
            card.classList.add("tilt");
            var g = document.createElement("span"); g.className = "glare"; card.appendChild(g);
            card.addEventListener("mousemove", function (e) {
                var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.classList.add("is-tilting");
                card.style.transform = "perspective(900px) rotateY(" + ((px - .5) * 9) + "deg) rotateX(" + ((.5 - py) * 9) + "deg) translateY(-6px)";
                card.style.setProperty("--mx", (px * 100) + "%"); card.style.setProperty("--my", (py * 100) + "%");
            });
            card.addEventListener("mouseleave", function () { card.classList.remove("is-tilting"); card.style.transform = ""; });
        });

        /* magnetic buttons */
        $$(".btn.py-3, .btn.py-2").forEach(function (b) {
            b.addEventListener("mousemove", function (e) {
                var r = b.getBoundingClientRect();
                b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .22) + "px," + ((e.clientY - r.top - r.height / 2) * .35 - 3) + "px)";
            });
            b.addEventListener("mouseleave", function () { b.style.transform = ""; });
        });

        /* parallax for about collage + sub-page header text */
        var par = $$(".about-item-image, .bg-breadcrumb .container");
        if (par.length) {
            window.addEventListener("scroll", function () {
                par.forEach(function (el) {
                    var r = el.getBoundingClientRect();
                    if (r.bottom < 0 || r.top > window.innerHeight) return;
                    var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
                    el.style.translate = "0 " + off.toFixed(1) + "px";
                });
            }, { passive: true });
        }
    }
})();

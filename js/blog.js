const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealPosts = (elements) => {
    // FIX #1: convertim NodeList la Array pentru siguranta
    const els = Array.from(elements);
    if (!els.length) {
        return;
    }

    if (prefersReducedMotion) {
        els.forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
        });
        return;
    }

    els.forEach((element, index) => {
        element.style.opacity = "0";
        element.dataset.revealed = "false";
        element.style.transform = "translateY(52px)";
        element.style.transition = `opacity 880ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 95}ms, transform 880ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 95}ms, box-shadow 250ms ease`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            // FIX #2: marcam ca revealed pentru a evita conflictul cu hover
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    els.forEach((element) => observer.observe(element));
};

const addMagneticLinks = () => {
    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll(".hero-link, .post-footer a").forEach((link) => {
        // FIX #3: nu setam transition inline aici ca sa nu suprascriem
        // alte transition-uri setate din alta parte (ex: CSS)
        link.addEventListener("mousemove", (event) => {
            const rect = link.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
            link.style.transform = `translate(${x}px, ${y}px)`;
        });

        link.addEventListener("mouseleave", () => {
            link.style.transform = "translate(0, 0)";
        });
    });
};

const articleLinks = document.querySelectorAll('.post-footer a[href="#"]');
articleLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const card = link.closest(".post-card");
        const title = card?.querySelector("h4")?.textContent ?? "This article";

        // FIX #4: salvam textul original pentru a putea reveni daca e nevoie
        // si folosim innerHTML pentru a nu pierde eventuale iconite SVG
        const svg = link.querySelector("svg");
        link.innerHTML = "";
        if (svg) link.appendChild(svg);
        link.appendChild(document.createTextNode(" Coming Soon"));

        link.setAttribute("aria-label", `${title} is coming soon`);
        link.style.color = "#2f855a";

        // FIX #5: dezactivam magnetic hover dupa click ca sa nu mai
        // miște un link care nu mai e activ
        link.style.pointerEvents = "none";
    });
});

const readArticlesLink = document.querySelector('.hero-link[href="#latest-posts"]');
readArticlesLink?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#latest-posts")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });
});

const posts = Array.from(document.querySelectorAll(".featured-post, .side-post, .post-card"));
revealPosts(posts);
addMagneticLinks();

// FIX #2: hover verificat daca reveal s-a terminat
if (!prefersReducedMotion) {
    posts.forEach((post) => {
        post.addEventListener("mouseenter", () => {
            if (post.dataset.revealed === "false") return;
            post.style.transform = "translateY(-10px)";
            post.style.boxShadow = "0 22px 42px rgba(15, 23, 42, 0.14)";
        });

        post.addEventListener("mouseleave", () => {
            if (post.dataset.revealed === "false") return;
            post.style.transform = "translateY(0)";
            post.style.boxShadow = "";
        });
    });
}
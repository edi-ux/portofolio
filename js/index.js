const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = (selectors, options = {}) => {
    const elements = document.querySelectorAll(selectors);
    if (!elements.length) {
        return;
    }

    if (prefersReducedMotion) {
        elements.forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
        });
        return;
    }

    const delayStep = options.delayStep ?? 110;
    const initialTransform = options.initialTransform ?? "translateY(55px)";

    elements.forEach((element, index) => {
        element.style.opacity = "0";
        // FIX #3: Salvam transform-ul de hover separat ca sa nu se suprascriera
        element.dataset.revealed = "false";
        element.style.transform = initialTransform;
        element.style.transition = `opacity 820ms cubic-bezier(0.22, 1, 0.36, 1) ${index * delayStep}ms, transform 820ms cubic-bezier(0.22, 1, 0.36, 1) ${index * delayStep}ms, box-shadow 250ms ease`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            // FIX #3: Marcam elementul ca revealed pentru hover
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.16 });

    elements.forEach((element) => observer.observe(element));
};

// FIX #3: hover lift verifica daca elementul a fost deja revealed
const addHoverLift = (selectors, lift = 10) => {
    if (prefersReducedMotion) {
        return;
    }

    const elements = document.querySelectorAll(selectors);
    elements.forEach((element) => {
        element.addEventListener("mouseenter", () => {
            if (element.dataset.revealed === "false") return;
            element.style.transform = `translateY(-${lift}px)`;
            element.style.boxShadow = "0 20px 38px rgba(15, 23, 42, 0.16)";
        });

        element.addEventListener("mouseleave", () => {
            if (element.dataset.revealed === "false") return;
            element.style.transform = "translateY(0)";
            element.style.boxShadow = "";
        });
    });
};

const addHeroFloat = () => {
    const hero = document.querySelector(".hero-text");
    if (!hero || prefersReducedMotion) {
        return;
    }

    window.addEventListener("mousemove", (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * 8;
        hero.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    // FIX #2: document in loc de window pentru mouseleave
    document.addEventListener("mouseleave", () => {
        hero.style.transform = "translate3d(0, 0, 0)";
    });
};

const projectButtons = document.querySelectorAll(".project-card .project-btn");
projectButtons.forEach((button) => {
    if (button.tagName !== "A" || button.getAttribute("href") === "#") {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const title = button.closest(".project-card")?.querySelector("h4")?.textContent ?? "This project";

            // FIX #1: folosim innerHTML in loc de textContent ca sa nu stergem SVG-ul
            // Pastram SVG-ul si schimbam doar textul
            const svg = button.querySelector("svg");
            button.innerHTML = "";
            if (svg) button.appendChild(svg);
            button.appendChild(document.createTextNode(" Coming Soon"));

            button.setAttribute("aria-label", `${title} repository link coming soon`);
            button.style.backgroundColor = "#2f855a";
            button.style.transform = "scale(1.03)";
            window.setTimeout(() => {
                button.style.transform = "scale(1)";
            }, 180);
        });
    }
});

const skills = document.querySelectorAll(".skill-card");
skills.forEach((skill) => {
    skill.addEventListener("mouseenter", () => {
        const icon = skill.querySelector(".skill-icon");
        if (icon) {
            icon.style.transform = "translateY(-4px) scale(1.08)";
            icon.style.transition = "transform 220ms ease";
        }
    });

    skill.addEventListener("mouseleave", () => {
        const icon = skill.querySelector(".skill-icon");
        if (icon) {
            icon.style.transform = "translateY(0) scale(1)";
        }
    });
});

// FIX #4: smooth scroll doar daca CSS scroll-behavior nu e setat
const skillsLink = document.querySelector('a[href="#skills"]');
skillsLink?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#skills")?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });
});

revealElements(".hero-text", { delayStep: 0, initialTransform: "translateY(40px)" });
revealElements(".project-card", { delayStep: 120, initialTransform: "translateY(60px)" });
revealElements(".skill-card", { delayStep: 90, initialTransform: "translateY(42px)" });
addHoverLift(".project-card", 12);
addHoverLift(".skill-card", 8);
addHeroFloat();
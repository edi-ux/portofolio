const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const staggerReveal = (elements, initialTransform, threshold = 0.12) => {
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
        element.style.transform = initialTransform;
        element.style.transition = `opacity 860ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 110}ms, transform 860ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 110}ms, box-shadow 240ms ease`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
        });
    }, { threshold });

    els.forEach((element) => observer.observe(element));
};

const addCardHoverDepth = () => {
    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll(".project-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
            if (card.dataset.revealed === "false") return;
            card.style.transform = "translateY(-12px)";
            card.style.boxShadow = "0 24px 42px rgba(15, 23, 42, 0.18)";
        });

        card.addEventListener("mouseleave", () => {
            if (card.dataset.revealed === "false") return;
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
        });
    });
};

const buttons = document.querySelectorAll(".project-btn");
buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
        if (prefersReducedMotion) {
            return;
        }
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 10px 22px rgba(0, 179, 255, 0.22)";
    });

    button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "none";
    });

    button.addEventListener("click", (event) => {
        const href = button.getAttribute("href");
        if (href && href !== "#") {
            return;
        }

        event.preventDefault();

        const card = button.closest(".project-card");
        const description = card?.querySelector("h5:not(.dev)");
        if (description) {
            description.textContent = "Repository link will be added soon.";
        }

        const svg = button.querySelector("svg");
        button.innerHTML = "";
        if (svg) button.appendChild(svg);
        button.appendChild(document.createTextNode(" Link Soon"));

        button.style.backgroundColor = "#2f855a";
        button.style.transform = "scale(1.03)";

        window.setTimeout(() => {
            button.style.transform = "translateY(0)";
        }, 180);
    });
});

const heroText = document.querySelectorAll(".hero-text h1, .hero-text p");
staggerReveal(heroText, "translateY(36px)", 0);
staggerReveal(document.querySelectorAll(".project-card"), "translateY(62px)");
addCardHoverDepth();

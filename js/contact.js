const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = () => {
    const contactItems = document.querySelectorAll(".hero-text, .contact-info, .contact-info p, .more-info .content");

    if (!contactItems.length) {
        return;
    }

    if (prefersReducedMotion) {
        contactItems.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "none";
        });
        return;
    }

    contactItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(42px)";
        item.style.transition = `opacity 820ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 95}ms, transform 820ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 95}ms`;
    });

    // FIX #1: un singur requestAnimationFrame nu e suficient —
    // browserul nu a aplicat inca opacity: 0 si transform inainte sa trecem la reveal.
    // Folosim doua rAF imbricate pentru a ne asigura ca stilurile initiale
    // sunt painted inainte de a declansa tranzitia.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            contactItems.forEach((item) => {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            });
        });
    });
};

const addContactHover = () => {
    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll(".contact-info p").forEach((item) => {
        // FIX #2: transition-ul de aici suprascria cel din revealItems
        // daca elementul era si in .contact-info p selector.
        // Adaugam color in loc sa suprascriem tot transition-ul.
        item.addEventListener("mouseenter", () => {
            item.style.transform = "translateX(6px)";
        });

        item.addEventListener("mouseleave", () => {
            item.style.transform = "translateX(0)";
        });
    });
};

const emailLink = document.querySelector('a[href^="mailto:"]');
emailLink?.addEventListener("click", async (event) => {
    // FIX #3: salvam email si href inainte de orice modificare async
    // altfel daca textContent se schimba, emailLink.href ramane ok dar
    // emailLink.textContent ar fi deja "Email copied" la restore
    const email = emailLink.textContent?.trim();
    const href = emailLink.href;

    if (!navigator.clipboard || !email) {
        return;
    }

    event.preventDefault();

    try {
        await navigator.clipboard.writeText(email);
        emailLink.textContent = "Email copied ✓";
        emailLink.style.color = "#2f855a";

        window.setTimeout(() => {
            // FIX #3: folosim variabilele salvate, nu emailLink.textContent live
            emailLink.textContent = email;
            emailLink.style.color = "";
            // FIX #4: deschidem mailto dupa restore ca UX sa fie clar
            // userul vede ca s-a copiat, apoi se deschide clientul de mail
            window.location.href = href;
        }, 900);
    } catch (error) {
        // FIX #5: daca clipboard esueaza, navigam direct fara alte efecte
        window.location.href = href;
    }
});

revealItems();
addContactHover();
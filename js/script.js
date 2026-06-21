document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-ready");

  class ForestParticle {
    constructor(canvas, isEntrance) {
      this.canvas = canvas;
      this.cx = canvas.width / 2;
      this.cy = canvas.height / 2;
      this.isEntrance = isEntrance;

      // Type: 'firefly' (50%), 'flower' (30%), 'discoball' (20%)
      const randType = Math.random();
      if (randType < 0.5) {
        this.type = "firefly";
      } else if (randType < 0.8) {
        this.type = "flower";
      } else {
        this.type = "discoball";
      }

      // 3D depth coordinate: 0.5 (foreground) to 3.0 (background)
      this.z = Math.random() * 2.2 + 0.6;
      
      // Horizontal coordinate
      if (isEntrance) {
        // Entrance: particles are already gliding leftwards
        this.x = Math.random() * canvas.width * 1.5 - canvas.width * 0.5;
        this.y = Math.random() * canvas.height;
      } else {
        // Exit: spawn particles horizontally across and off-screen to slide in
        this.x = Math.random() * canvas.width * 1.6;
        this.y = Math.random() * canvas.height;
      }

      // Kinematics simulating horizontal and forward camera glide
      this.speedX = Math.random() * 5 + 4; // base horizontal drift speed
      this.speedZ = Math.random() * 0.016 + 0.012; // base zoom/forward speed
      this.speedY = Math.random() * 0.8 - 0.4; // slight vertical hover oscillation

      // Rotations and twinkles
      this.rotation = Math.random() * Math.PI * 2;
      this.speedRotation = (Math.random() * 0.012 + 0.006) * (Math.random() < 0.5 ? 1 : -1);

      this.twinkleRate = Math.random() * 0.08 + 0.04;
      this.twinklePhase = Math.random() * Math.PI * 2;

      // Styles based on particle type
      if (this.type === "firefly") {
        this.baseSize = Math.random() * 1.8 + 1.2;
        const fireflyColors = ["rgba(178, 255, 89, 1)", "rgba(212, 245, 122, 1)", "rgba(234, 255, 140, 1)"];
        this.color = fireflyColors[Math.floor(Math.random() * fireflyColors.length)];
      } else if (this.type === "flower") {
        this.baseSize = Math.random() * 8 + 6;
        const flowerColors = ["rgba(255, 183, 197, 1)", "rgba(230, 230, 250, 1)", "rgba(244, 200, 220, 1)"];
        this.color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      } else {
        // Golden discoball light
        this.baseSize = Math.random() * 35 + 25;
        this.color = "rgba(255, 218, 115, 0.4)";
        this.glowColor = "rgba(234, 161, 25, 0.15)";
      }

      this.opacity = 0;
    }

    update() {
      this.twinklePhase += this.twinkleRate;

      this.x -= this.speedX;
      this.y += this.speedY;
      this.z -= this.speedZ;
      this.rotation += this.speedRotation;

      if (this.z <= 0.15) {
        this.opacity = 0;
        return;
      }

      // Easing/fading based on depth
      if (this.z > 0.45) {
        if (this.isEntrance) {
          this.opacity = Math.min(1, this.z / 0.8);
        } else {
          this.opacity = Math.min(1, (3.0 - this.z) * 1.5);
        }
      } else {
        // Fade out as they glide very close to camera
        this.opacity = Math.max(0, (this.z - 0.15) * 3.33);
      }
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      // Perspective projection calculation
      const projX = this.cx + (this.x - this.cx) / this.z;
      const projY = this.cy + (this.y - this.cy) / this.z;
      const projSize = this.baseSize / this.z;

      // Skip drawing if out of bounds
      if (
        projX < -projSize * 2 ||
        projX > this.canvas.width + projSize * 2 ||
        projY < -projSize * 2 ||
        projY > this.canvas.height + projSize * 2
      ) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = this.opacity;

      if (this.type === "firefly") {
        const flicker = Math.sin(this.twinklePhase) * 0.35 + 0.65;
        ctx.globalAlpha = this.opacity * flicker;
        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = projSize * 4;
        ctx.shadowColor = this.color;
        ctx.fill();
      } else if (this.type === "flower") {
        this.drawFlower(ctx, projX, projY, projSize, this.rotation);
      } else {
        this.drawDiscoballLight(ctx, projX, projY, projSize, this.rotation);
      }

      ctx.restore();
    }

    drawFlower(ctx, x, y, size, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Glowing flower center
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = "#fffdd0";
      ctx.shadowBlur = size * 1.5;
      ctx.shadowColor = this.color;
      ctx.fill();

      // Draw 5 petals
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.color;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = (i * Math.PI * 2) / 5;
        const petalLength = size;
        const petalWidth = size * 0.45;
        
        const tipX = Math.cos(angle) * petalLength;
        const tipY = Math.sin(angle) * petalLength;
        
        const ctrlX1 = Math.cos(angle - 0.3) * petalWidth;
        const ctrlY1 = Math.sin(angle - 0.3) * petalWidth;
        const ctrlX2 = Math.cos(angle + 0.3) * petalWidth;
        const ctrlY2 = Math.sin(angle + 0.3) * petalWidth;

        ctx.quadraticCurveTo(ctrlX1, ctrlY1, tipX, tipY);
        ctx.quadraticCurveTo(ctrlX2, ctrlY2, 0, 0);
        ctx.fill();
      }
      ctx.restore();
    }

    drawDiscoballLight(ctx, x, y, size, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Gradient representing soft glowing orb
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      grad.addColorStop(0, this.color);
      grad.addColorStop(0.35, this.glowColor);
      grad.addColorStop(1, "rgba(255, 218, 115, 0)");
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sparkly grid facets reflecting like a discoball
      ctx.globalAlpha = this.opacity * 0.75;
      const facets = 10;
      const facetRadius = size * 0.12;
      for (let i = 0; i < facets; i++) {
        const angle = (i * Math.PI * 2) / facets;
        const dist = size * (0.35 + Math.sin(i * 1.8) * 0.15);
        const fx = Math.cos(angle) * dist;
        const fy = Math.sin(angle) * dist;
        
        const facetShimmer = Math.sin(this.twinklePhase + i) * 0.4 + 0.6;
        
        ctx.beginPath();
        ctx.arc(fx, fy, facetRadius * facetShimmer, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = facetRadius * 4.5;
        ctx.shadowColor = "#ffebc2";
        ctx.fill();
      }
      ctx.restore();
    }
  }

  document.querySelectorAll("a[href$='.html'], a[href*='.html#'], a[href*='.html?']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (!href || link.target || isModifiedClick || href === window.location.pathname.split("/").pop()) {
        return;
      }

      event.preventDefault();
      playNavigationTransition(href);
    });
  });

  document.querySelectorAll("img").forEach((image) => {
    if (image.complete && image.naturalWidth > 0) {
      image.classList.add("image-loaded");
    } else {
      image.addEventListener("load", () => image.classList.add("image-loaded"), { once: true });
      image.addEventListener("error", () => {
        image.classList.add("image-loaded");
        image.closest("figure")?.classList.add("image-missing");
      }, { once: true });
    }
  });

  document.querySelectorAll(".gallery-slide figcaption").forEach((caption) => {
    const text = caption.textContent.trim();
    if (!text || caption.querySelector(".caption-marquee")) {
      return;
    }
    caption.innerHTML = `
      <span class="caption-marquee" aria-hidden="true">
        <span>${text}</span><span>${text}</span><span>${text}</span><span>${text}</span>
      </span>
      <span class="sr-only">${text}</span>
    `;
  });

  const revealTargets = document.querySelectorAll(
    ".section:not(.menu-experience), .dish-card, blockquote, .offer-card, .memory-image, .gallery-stage, .story-step, .luxury-form"
  );

  revealTargets.forEach((element) => element.classList.add("reveal"));

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
    : null;

  document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) {
      revealObserver.observe(element);
    } else {
      element.classList.add("visible");
    }
  });

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("open") || false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const curateModal = document.querySelector(".curate-modal");
  const curateOpen = document.querySelector("[data-curate-open]");
  const curateClose = document.querySelector(".curate-close");
  const curateSteps = Array.from(document.querySelectorAll(".curate-step"));
  const curateProgress = document.querySelector(".curate-progress span");
  const experienceCard = document.querySelector(".experience-card");
  const reserveEvening = document.querySelector("[data-reserve-evening]");
  const curateSelections = {};
  let activeCurateStep = 0;

  const experienceRecommendations = {
    "Romantic Escape": ["Truffle Risotto", "Filet Mignon", "Berry Panna Cotta"],
    Celebration: ["Butter-Poached Lobster Tail", "Chef's Plated Duck", "Dark Chocolate Torte"],
    "Wine & Conversation": ["Truffle Risotto", "Prime Ribeye", "Dessert Assortment"],
    "Quiet Comfort Evening": ["Gourmet Selection", "Truffle Risotto", "Berry Panna Cotta"],
    "Sunset Dining": ["Gourmet Selection", "Butter-Poached Lobster Tail", "Berry Panna Cotta"],
    "Birthday Surprise": ["Butter-Poached Lobster Tail", "Filet Mignon", "Dessert Assortment"]
  };

  function setCurateStep(step) {
    activeCurateStep = Math.max(0, Math.min(step, curateSteps.length - 1));
    curateSteps.forEach((panel, index) => {
      panel.classList.toggle("active", index === activeCurateStep);
    });
    if (curateProgress) {
      curateProgress.style.width = `${((activeCurateStep + 1) / curateSteps.length) * 100}%`;
    }
  }

  function buildExperienceCard() {
    if (!experienceCard) {
      return;
    }

    const evening = curateSelections.evening || "Romantic Escape";
    const company = curateSelections.company || "Partner";
    const atmosphere = curateSelections.atmosphere || "Candlelight Corner";
    const dietary = curateSelections.dietary || "Vegetarian";
    const recommended = experienceRecommendations[evening] || experienceRecommendations["Romantic Escape"];
    const note = `Crafted for ${company.toLowerCase()} dining, ${atmosphere.toLowerCase()}, and unforgettable evenings.`;

    experienceCard.innerHTML = `
      <h3>Your Gourmet Evening</h3>
      <ul>
        <li><strong>Evening:</strong> ${evening}</li>
        <li><strong>Company:</strong> ${company}</li>
        <li><strong>Atmosphere:</strong> ${atmosphere}</li>
        <li><strong>Preference:</strong> ${dietary}</li>
      </ul>
      <p class="recommended"><strong>Recommended Experience:</strong><br>${recommended.join(" / ")}</p>
      <blockquote>"${note}"</blockquote>
    `;

    const params = new URLSearchParams({
      evening,
      company,
      atmosphere,
      dietary,
      dishes: recommended.join(", ")
    });
    const href = `reservation.html?${params.toString()}#reservationForm`;
    reserveEvening?.setAttribute("href", href);
    localStorage.setItem("gourmetEvening", JSON.stringify({ evening, company, atmosphere, dietary, dishes: recommended }));
  }

  function openCurateModal() {
    curateModal?.classList.add("open");
    curateModal?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setCurateStep(0);
  }

  function closeCurateModal() {
    curateModal?.classList.remove("open");
    curateModal?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  curateOpen?.addEventListener("click", openCurateModal);
  curateClose?.addEventListener("click", closeCurateModal);
  curateModal?.addEventListener("click", (event) => {
    if (event.target === curateModal) {
      closeCurateModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && curateModal?.classList.contains("open")) {
      closeCurateModal();
    }
  });

  document.querySelectorAll(".curate-options button").forEach((button) => {
    button.addEventListener("click", () => {
      const { key, value } = button.dataset;
      if (!key || !value) {
        return;
      }
      curateSelections[key] = value;
      button.parentElement?.querySelectorAll("button").forEach((option) => {
        option.classList.toggle("selected", option === button);
      });
      if (activeCurateStep >= 3) {
        buildExperienceCard();
      }
      window.setTimeout(() => setCurateStep(activeCurateStep + 1), 180);
    });
  });

  function fieldMessage(form, field) {
    return form.querySelector(`[data-error-for="${field.id}"]`);
  }

  function fieldRow(field) {
    if (field.parentElement?.querySelector(".field-message")) {
      return field.parentElement;
    }
    return field.closest(".form-row") || field.parentElement;
  }

  function setFieldError(form, field, message) {
    const messageElement = fieldMessage(form, field);
    const row = fieldRow(field);
    if (messageElement) {
      messageElement.textContent = message;
    }
    row?.classList.toggle("invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function clearReservationErrors(form) {
    form.querySelectorAll(".field-message").forEach((message) => {
      message.textContent = "";
    });
    form.querySelectorAll(".invalid").forEach((row) => row.classList.remove("invalid"));
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.setAttribute("aria-invalid", "false");
    });
  }

  function selectedDate(dateValue) {
    const parts = dateValue.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function timeToMinutes(timeValue) {
    const [hours, minutes] = timeValue.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }
    return (hours * 60) + minutes;
  }

  function operatingHoursFor(date) {
    const day = date.getDay();
    if (day === 0) {
      return { open: 12 * 60, close: 21 * 60 };
    }
    if (day === 5 || day === 6) {
      return { open: 17 * 60, close: (23 * 60) + 30 };
    }
    return { open: 17 * 60, close: 22 * 60 };
  }

  function isWithinOperatingHours(dateValue, timeValue) {
    const date = selectedDate(dateValue);
    const reservationMinutes = timeToMinutes(timeValue);
    if (!date || reservationMinutes === null) {
      return false;
    }
    const hours = operatingHoursFor(date);
    return reservationMinutes >= hours.open && reservationMinutes <= hours.close;
  }

  function validateReservationForm(form) {
    clearReservationErrors(form);

    const name = form.querySelector("#reservationName");
    const email = form.querySelector("#reservationEmail");
    const phone = form.querySelector("#reservationPhone");
    const date = form.querySelector("#reservationDate");
    const time = form.querySelector("#reservationTime");
    const guests = form.querySelector("#reservationGuests");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let firstInvalid = null;

    function mark(field, message) {
      if (!firstInvalid) {
        firstInvalid = field;
      }
      setFieldError(form, field, message);
    }

    if (!name.value.trim()) {
      mark(name, "Please enter your name.");
    }
    if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
      mark(email, "Please enter a valid email address.");
    }
    if (!phone.value.trim()) {
      mark(phone, "Please enter your phone number.");
    }
    if (!date.value) {
      mark(date, "Please choose a reservation date.");
    }
    if (!time.value) {
      mark(time, "Please choose a reservation time.");
    }
    if (!guests.value || Number(guests.value) < 1 || Number(guests.value) > 20) {
      mark(guests, "Please choose between 1 and 20 guests.");
    }
    if (date.value && time.value && !isWithinOperatingHours(date.value, time.value)) {
      mark(time, "Sorry, reservations are not available at the selected time. Please choose a time within our operating hours.");
    }

    const seatInput = form.querySelector("#selectedSeatInput");
    const walkInCheck = form.querySelector("#walkInCheckbox");
    if (seatInput && !seatInput.value && walkInCheck && !walkInCheck.checked) {
      mark(seatInput, "Please select a seat on the floor plan or select Walk-In.");
    }

    if (firstInvalid) {
      if (firstInvalid !== seatInput) {
        firstInvalid.focus();
      }
      return false;
    }

    return true;
  }

  const forms = document.querySelectorAll(".luxury-form");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (form.id === "reservationForm") {
        const message = form.querySelector(".form-message");
        if (message) {
          message.textContent = "";
        }

        if (!validateReservationForm(form)) {
          return;
        }

        const nameVal = form.querySelector("#reservationName")?.value || "";
        const emailVal = form.querySelector("#reservationEmail")?.value || "";
        const phoneVal = form.querySelector("#reservationPhone")?.value || "";
        const dateVal = form.querySelector("#reservationDate")?.value || "";
        const timeVal = form.querySelector("#reservationTime")?.value || "";
        const seatVal = document.querySelector("#selectedSeatInput")?.value || "";
        const areaVal = document.querySelector("#selectedAreaInput")?.value || "";
        const notesVal = form.querySelector("#reservationNotes")?.value || "";

        // Check for double booking
        let bookings = [];
        try {
          bookings = JSON.parse(localStorage.getItem("gourmet_bookings") || "[]");
        } catch(e) {
          bookings = [];
        }

        if (seatVal !== "Walk-In") {
          const isDoubleBooked = bookings.some(b => b.date === dateVal && b.time === timeVal && b.seat_id === seatVal);
          if (isDoubleBooked) {
            if (message) {
              message.style.color = "var(--red)";
              message.textContent = "This seat has already been booked for this date and time. Please choose another seat.";
            }
            return;
          }
        }

        // Save the booking to the database (localStorage)
        bookings.push({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          date: dateVal,
          time: timeVal,
          seat_id: seatVal,
          dining_area: areaVal,
          notes: notesVal
        });
        localStorage.setItem("gourmet_bookings", JSON.stringify(bookings));

        // Show Mock SMS Sent Toast notification
        const smsToast = document.querySelector("#smsToast");
        const smsPhone = document.querySelector("#smsPhone");
        const smsDateTime = document.querySelector("#smsDateTime");
        if (smsToast && smsPhone) {
          smsPhone.textContent = phoneVal;
          
          // Format date and time for SMS message
          let dateTimeStr = "";
          if (dateVal && timeVal) {
            const d = new Date(dateVal);
            const dateStr = d.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            });
            const parts = timeVal.split(":");
            let hour = parseInt(parts[0]);
            const min = parts[1];
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            const timeStr = `${hour}:${min} ${ampm}`;
            dateTimeStr = `${dateStr} at ${timeStr}`;
          }
          
          if (smsDateTime) {
            smsDateTime.textContent = dateTimeStr;
          }
          
          smsToast.classList.add("show");
          setTimeout(() => {
            smsToast.classList.remove("show");
          }, 5000);
        }

        const submitBtn = form.querySelector("button[type='submit']");
        if (submitBtn) {
          submitBtn.disabled = true;
          window.setTimeout(() => {
            submitBtn.disabled = false;
          }, 6500);
        }
        showReservationCelebration();

        // Update visual seat occupancy immediately
        if (typeof updateOccupiedSeats === "function") {
          updateOccupiedSeats();
        }

        window.setTimeout(() => form.reset(), 5200);
        return;
      }

      const message = form.querySelector(".form-message");
      if (message) {
        message.textContent = "Thank you. Your message has been sent.";
      }

      form.reset();
    });
  });

  const reservationForm = document.querySelector("#reservationForm");
  if (reservationForm) {
    const params = new URLSearchParams(window.location.search);
    let savedExperience = null;

    try {
      savedExperience = JSON.parse(localStorage.getItem("gourmetEvening") || "null");
    } catch (error) {
      savedExperience = null;
    }

    const curated = {
      evening: params.get("evening") || savedExperience?.evening,
      company: params.get("company") || savedExperience?.company,
      atmosphere: params.get("atmosphere") || savedExperience?.atmosphere,
      dietary: params.get("dietary") || savedExperience?.dietary,
      dishes: params.get("dishes") || savedExperience?.dishes?.join(", ")
    };

    if (curated.evening) {
      const notes = reservationForm.querySelector("#reservationNotes");
      const guests = reservationForm.querySelector("#reservationGuests");
      if (guests && curated.company) {
        guests.value = curated.company === "Solo" ? "1" : curated.company === "Partner" ? "2" : "4";
      }
      if (notes && !notes.value) {
        notes.value = `Curated evening: ${curated.evening}. Dining with: ${curated.company}. Atmosphere: ${curated.atmosphere}. Dietary preference: ${curated.dietary}. Recommended experience: ${curated.dishes}.`;
        notes.dataset.touched = "true";
      }
    }

    reservationForm.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => setFieldError(reservationForm, field, ""));
      field.addEventListener("change", () => setFieldError(reservationForm, field, ""));
    });

    // Dynamic time filtering based on selected date
    const dateInput = reservationForm.querySelector("#reservationDate");
    const timeSelect = reservationForm.querySelector("#reservationTime");

    function updateTimeOptions() {
      const dateValue = dateInput.value;
      if (!dateValue) {
        // If no date selected, show all options
        timeSelect.querySelectorAll("option").forEach(option => {
          option.style.display = "";
        });
        return;
      }

      const date = selectedDate(dateValue);
      if (!date) return;

      const hours = operatingHoursFor(date);
      const openMinutes = hours.open;
      const closeMinutes = hours.close;

      timeSelect.querySelectorAll("option").forEach(option => {
        if (option.value === "") {
          option.style.display = "";
          return;
        }

        const timeMinutes = timeToMinutes(option.value);
        if (timeMinutes === null) {
          option.style.display = "";
          return;
        }

        // Show option only if within operating hours
        if (timeMinutes >= openMinutes && timeMinutes <= closeMinutes) {
          option.style.display = "";
        } else {
          option.style.display = "none";
        }
      });

      // Reset time selection if current selection is no longer valid
      if (timeSelect.value && !isWithinOperatingHours(dateValue, timeSelect.value)) {
        timeSelect.value = "";
      }
    }

    dateInput?.addEventListener("change", updateTimeOptions);
    // Initialize time options on page load if date is already set
    if (dateInput?.value) {
      updateTimeOptions();
    }
  }

  function triggerGlitterShower() {
    const container = document.createElement("div");
    container.className = "glitter-shower-container";
    document.body.appendChild(container);

    const goldGlows = ["rgba(244, 208, 104, 0.4)", "rgba(252, 213, 129, 0.4)", "rgba(212, 175, 55, 0.4)"];

    function createSparkle(isBurst) {
      const sparkle = document.createElement("div");
      sparkle.className = "glitter-sparkle image-sparkle";

      const size = Math.floor(Math.random() * 18) + 10;
      const imageAsset = Math.random() < 0.5 ? "images/glitter1.jpg" : "images/glitter2.jpg";
      const glowColor = goldGlows[Math.floor(Math.random() * goldGlows.length)];
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() * 28) - 14;
      const spin = (Math.random() * 1080) - 540;
      const duration = (Math.random() * 1.8) + 2.4;
      const maxOpacity = (Math.random() * 0.35) + 0.65;
      const twinkleDur = (Math.random() * 0.5) + 0.3;

      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.setProperty("--sparkle-image", `url("${imageAsset}")`);
      sparkle.style.setProperty("--glow-color", glowColor);
      sparkle.style.setProperty("--start-x", `${startX}vw`);
      sparkle.style.setProperty("--end-x", `${endX}vw`);
      sparkle.style.setProperty("--fall-duration", `${duration}s`);
      sparkle.style.setProperty("--spin", `${spin}deg`);
      sparkle.style.setProperty("--max-opacity", maxOpacity);
      sparkle.style.setProperty("--twinkle-duration", `${twinkleDur}s`);

      if (isBurst) {
        sparkle.style.animationDelay = `${Math.random() * 0.4}s`;
      }

      container.appendChild(sparkle);
    }

    for (let i = 0; i < 140; i++) {
      createSparkle(true);
    }

    const rainInterval = setInterval(() => {
      createSparkle(false);
      if (Math.random() < 0.4) {
        createSparkle(false);
      }
    }, 16);

    setTimeout(() => {
      clearInterval(rainInterval);
    }, 2200);

    setTimeout(() => {
      container.style.opacity = "0";
    }, 3800);

    setTimeout(() => {
      container.remove();
    }, 5000);
  }

  function showReservationCelebration() {
    const celebration = document.querySelector(".reservation-celebration");
    if (!celebration) {
      return;
    }

    const nameVal = document.querySelector("#reservationName")?.value || "";
    const dateVal = document.querySelector("#reservationDate")?.value || "";
    const timeVal = document.querySelector("#reservationTime")?.value || "";
    const seatVal = document.querySelector("#selectedSeatInput")?.value || "";
    const areaVal = document.querySelector("#selectedAreaInput")?.value || "";

    const confNameEl = celebration.querySelector("#confName");
    const confDateEl = celebration.querySelector("#confDate");
    const confTimeEl = celebration.querySelector("#confTime");
    const confSeatEl = celebration.querySelector("#confSeat");
    const confAreaEl = celebration.querySelector("#confArea");

    if (confNameEl) confNameEl.textContent = nameVal;
    
    if (confDateEl) {
      if (dateVal) {
        const d = new Date(dateVal);
        confDateEl.textContent = d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      } else {
        confDateEl.textContent = "";
      }
    }
    
    if (confTimeEl) {
      if (timeVal) {
        const parts = timeVal.split(":");
        let hour = parseInt(parts[0]);
        const min = parts[1];
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        confTimeEl.textContent = `${hour}:${min} ${ampm}`;
      } else {
        confTimeEl.textContent = "";
      }
    }
    
    if (confSeatEl) {
      confSeatEl.textContent = seatVal === "Walk-In" ? "Choose Upon Arrival" : `Seat ${seatVal}`;
    }
    
    if (confAreaEl) {
      confAreaEl.textContent = seatVal === "Walk-In" ? "Upon Arrival" : areaVal;
    }

    celebration.setAttribute("aria-hidden", "false");
    celebration.classList.add("show");
    const celebrationTitle = celebration.querySelector(".celebration-card h2");
    if (celebrationTitle) {
      celebrationTitle.textContent = "\u2728 Your Table Awaits You \u2728";
    }

    // Enhance champagne popping inside the card container
    const scene = celebration.querySelector(".champagne-scene");
    if (scene) {
      scene.querySelectorAll(".champagne-cork, .champagne-bubble").forEach(el => el.remove());

      // Create cork
      const cork = document.createElement("div");
      cork.className = "champagne-cork";
      cork.style.left = "calc(50% - 7px)";
      cork.style.top = "15px";
      scene.appendChild(cork);

      // Animate popping cork and bubbles after shake (0.8s)
      window.setTimeout(() => {
        cork.classList.add("popped");
        
        // Spray bubbles from mouth
        const bubbleCount = 40;
        for (let i = 0; i < bubbleCount; i++) {
          window.setTimeout(() => {
            const bubble = document.createElement("div");
            bubble.className = "champagne-bubble spray";
            const size = Math.floor(Math.random() * 8) + 3;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `calc(50% - ${size / 2}px)`;
            bubble.style.top = "15px";
            
            const angle = (Math.random() * 100 - 50) - 90; // upward cone
            const rad = angle * (Math.PI / 180);
            const dist = Math.random() * 150 + 50;
            const sprayX = Math.cos(rad) * dist;
            const sprayY = Math.sin(rad) * dist;
            
            const duration = Math.random() * 0.6 + 0.6;
            bubble.style.setProperty("--spray-x", `${sprayX}px`);
            bubble.style.setProperty("--spray-y", `${sprayY}px`);
            bubble.style.setProperty("--spray-duration", `${duration}s`);
            bubble.style.setProperty("--spray-scale", Math.random() * 1.2 + 0.4);
            
            scene.appendChild(bubble);
            
            window.setTimeout(() => bubble.remove(), duration * 1000);
          }, i * 10);
        }
      }, 800);
    }

    window.setTimeout(triggerGlitterShower, 1150);

    // After the toast, cork pop, glitter image rain, and message finish, hand off to the existing curtain transition.
    window.setTimeout(() => {
      celebration.classList.remove("show");
      celebration.setAttribute("aria-hidden", "true");
      playNavigationTransition("index.html");
    }, 5200);
  }

  const curtainImageSources = {
    flower1: "images/flower1_transparent.png",
    flowerNew: "images/Flower_new.png",
    starNew: "images/star_new.png",
    heartNew: "images/heart_new.png",
    sunNew: "images/sun_new.png",
    bigStarNew: "images/big_star_new.png"
  };

  function decorateCurtainAsset(inner, type, index, goldGlows) {
    if (type === "glitter") {
      const imageAsset = index % 2 === 0 ? "images/glitter1.jpg" : "images/glitter2.jpg";
      inner.style.setProperty("--sparkle-image", `url("${imageAsset}")`);
      const glowColor = goldGlows[Math.floor(Math.random() * goldGlows.length)];
      inner.style.setProperty("--glow-color", glowColor);
      inner.style.setProperty("--twinkle-duration", `${Math.random() * 0.4 + 0.3}s`);
      return;
    }

    const source = curtainImageSources[type];
    if (!source) {
      return;
    }

    inner.style.backgroundImage = `url("${source}")`;
    inner.classList.add("alpha-ready");
  }

  function playNavigationTransition(href) {
    const overlay = document.createElement("div");
    overlay.className = "transition-curtain-overlay";
    document.body.appendChild(overlay);

    // Trigger backdrop blur fade-in
    window.requestAnimationFrame(() => {
      overlay.classList.add("active-curtain");
    });

    const cols = 10;
    const rows = 8;
    const assetsData = [];
    const types = ["flower1", "flowerNew", "starNew", "heartNew", "sunNew", "bigStarNew", "glitter"];
    const goldGlows = ["rgba(244, 208, 104, 0.4)", "rgba(252, 213, 129, 0.4)", "rgba(212, 175, 55, 0.4)"];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Target coordinates in vw/vh
        const cellX = (c / cols) * 100;
        const cellY = (r / rows) * 100;
        const offsetX = Math.random() * (100 / cols);
        const offsetY = Math.random() * (100 / rows);
        const targetX = cellX + offsetX;
        const targetY = cellY + offsetY;

        // Start off-screen
        let startX = targetX;
        let startY = targetY;
        if (c < cols / 2) {
          startX = -25; // left
        } else {
          startX = 125; // right
        }
        if (r < rows / 2) {
          startY = startY - 50; // top
        } else {
          startY = startY + 50; // bottom
        }

        // End coordinates
        const endX = targetX + (Math.random() * 40 - 20);
        const endY = targetY + 120; // drop down off bottom

        // Size
        let size = 60;
        if (type === "bigStarNew") size = Math.floor(Math.random() * 70) + 70; // 70px to 140px
        else if (type === "glitter") size = Math.floor(Math.random() * 30) + 35; // 35px to 65px
        else size = Math.floor(Math.random() * 55) + 55; // 55px to 110px

        const targetRotate = Math.random() * 60 - 30;
        const spin = Math.random() * 720 - 360;

        assetsData.push({
          type,
          size,
          startX, startY,
          targetX, targetY,
          endX, endY,
          spin,
          targetRotate
        });
      }
    }

    // Spawn assets in closing state
    assetsData.forEach((data, index) => {
      const item = document.createElement("div");
      item.className = `curtain-item closing ${data.type}`;
      item.style.width = `${data.size}px`;
      item.style.height = `${data.size}px`;

      item.style.setProperty("--start-x", `${data.startX}vw`);
      item.style.setProperty("--start-y", `${data.startY}vh`);
      item.style.setProperty("--target-x", `${data.targetX}vw`);
      item.style.setProperty("--target-y", `${data.targetY}vh`);
      item.style.setProperty("--target-rotate", `${data.targetRotate}deg`);

      const inner = document.createElement("div");
      inner.className = "curtain-item-inner";
      
      decorateCurtainAsset(inner, data.type, index, goldGlows);

      item.appendChild(inner);
      overlay.appendChild(item);
    });

    // Wait for closing animation to complete (1.2 seconds), then navigate
    window.setTimeout(() => {
      sessionStorage.setItem("playRevealTransition", "true");
      sessionStorage.setItem("transitionAssets", JSON.stringify(assetsData));
      window.location.href = href;
    }, 1200);
  }

  function playRevealTransition() {
    const assetsDataStr = sessionStorage.getItem("transitionAssets");
    if (!assetsDataStr) return;
    sessionStorage.removeItem("transitionAssets");

    let assetsData;
    try {
      assetsData = JSON.parse(assetsDataStr);
    } catch (e) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "transition-curtain-overlay active-curtain";
    document.body.appendChild(overlay);

    // Trigger backdrop blur fade-out
    window.requestAnimationFrame(() => {
      overlay.classList.remove("active-curtain");
    });

    const goldGlows = ["rgba(244, 208, 104, 0.4)", "rgba(252, 213, 129, 0.4)", "rgba(212, 175, 55, 0.4)"];

    // Spawn same assets in opening state
    assetsData.forEach((data, index) => {
      const item = document.createElement("div");
      item.className = `curtain-item opening ${data.type}`;
      item.style.width = `${data.size}px`;
      item.style.height = `${data.size}px`;

      item.style.setProperty("--target-x", `${data.targetX}vw`);
      item.style.setProperty("--target-y", `${data.targetY}vh`);
      item.style.setProperty("--target-rotate", `${data.targetRotate}deg`);
      item.style.setProperty("--end-x", `${data.endX}vw`);
      item.style.setProperty("--end-y", `${data.endY}vh`);
      item.style.setProperty("--spin", `${data.spin}deg`);

      const inner = document.createElement("div");
      inner.className = "curtain-item-inner";
      
      decorateCurtainAsset(inner, data.type, index, goldGlows);

      item.appendChild(inner);
      overlay.appendChild(item);
    });

    // Cleanup after opening animation finishes (1.2s)
    window.setTimeout(() => {
      overlay.remove();
    }, 1200);
  }

  // Play the opening reveal transition on page load if navigation occurred.
  if (sessionStorage.getItem("playRevealTransition") === "true") {
    sessionStorage.removeItem("playRevealTransition");
    playRevealTransition();
  }

  const ambianceMessages = [
    "Tonight's Ambiance: Candlelit and unhurried.",
    "Best enjoyed during the blue hour.",
    "A quiet room, polished glassware, and one excellent dessert.",
    "Tonight feels made for a long conversation.",
    "Ask for the red wine pairing if the evening has weight."
  ];

  const ambiance = document.querySelector(".today-ambiance");
  if (ambiance) {
    ambiance.textContent = ambianceMessages[Math.floor(Math.random() * ambianceMessages.length)];
  }

  const menuCards = Array.from(document.querySelectorAll(".menu-wrapper .dish-card"));
  const dietaryInputs = Array.from(document.querySelectorAll("[data-filter='dietary']"));
  const moodButtons = Array.from(document.querySelectorAll("[data-mood]"));
  const moodMessage = document.querySelector(".mood-message");
  let activeMood = "";

  const moodCopy = {
    romantic: "For a romantic date, we are spotlighting soft textures, wine-friendly sauces, and a graceful finish.",
    family: "For family dinner, the warmer and more generous plates move forward.",
    celebration: "For a celebration, choose dishes with theatre, polish, and a little gold.",
    business: "For a business dinner, the kitchen suggests composed mains and confident pairings.",
    quiet: "For a quiet evening, we favor low spice, gentle texture, and a calm finish."
  };

  function updateMenuFilters() {
    const activeFilters = dietaryInputs.filter((input) => input.checked).map((input) => input.value);

    menuCards.forEach((card) => {
      const diets = (card.dataset.diet || "").split(/\s+/);
      const moods = (card.dataset.mood || "").split(/\s+/);
      const matchesDiet = activeFilters.every((filter) => diets.includes(filter));
      const matchesMood = activeMood ? moods.includes(activeMood) : true;

      card.classList.toggle("is-hidden", !matchesDiet);
      card.classList.toggle("is-dimmed", matchesDiet && activeMood && !matchesMood);
      card.classList.toggle("is-mood-match", matchesDiet && activeMood && matchesMood);
    });
  }

  dietaryInputs.forEach((input) => input.addEventListener("change", updateMenuFilters));

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeMood = activeMood === button.dataset.mood ? "" : button.dataset.mood;
      moodButtons.forEach((moodButton) => {
        moodButton.classList.toggle("active", moodButton.dataset.mood === activeMood);
      });
      if (moodMessage) {
        moodMessage.textContent = activeMood
          ? moodCopy[activeMood]
          : "Tell us the mood and we will softly spotlight the right plates.";
      }
      updateMenuFilters();
    });
  });

  const concierge = document.querySelector(".concierge-form");
  const conciergeResult = document.querySelector(".concierge-result ul");

  function updateConcierge() {
    if (!concierge || !conciergeResult) {
      return;
    }

    const data = new FormData(concierge);
    const diet = data.get("diet");
    const meal = data.get("meal");
    const flavor = data.get("flavor");
    const dessert = data.get("dessert");

    let starter = diet === "vegetarian" ? "Gourmet Selection" : "Butter-Poached Lobster Tail";
    let main = diet === "vegetarian" ? "Truffle Risotto" : "Chef's Plated Duck";
    let drink = diet === "vegetarian" ? "Chilled Sancerre" : "Pinot Noir from Burgundy";

    if (meal === "hearty") {
      starter = diet === "vegetarian" ? "Truffle Risotto" : "Chef's Plated Duck";
      main = diet === "vegetarian" ? "Truffle Risotto with market greens" : "Prime Ribeye";
      drink = diet === "vegetarian" ? "Oaked Chardonnay" : "Left Bank Bordeaux";
    }

    if (flavor === "spicy") {
      starter = diet === "vegetarian" ? "Gourmet Selection with peppered vinaigrette" : "Lobster Tail with warm saffron";
      drink = "Dry rose with a clean mineral finish";
    }

    const sweet = dessert === "yes"
      ? (flavor === "creamy" ? "Berry Panna Cotta" : "Dark Chocolate Torte")
      : "A final espresso and petit fours";

    conciergeResult.innerHTML = `
      <li><strong>Starter:</strong> ${starter}</li>
      <li><strong>Main course:</strong> ${main}</li>
      <li><strong>Dessert:</strong> ${sweet}</li>
      <li><strong>Drink pairing:</strong> ${drink}</li>
    `;
  }

  concierge?.addEventListener("change", updateConcierge);
  updateConcierge();

  const galleryStage = document.querySelector(".gallery-stage");
  const galleryTrack = document.querySelector(".gallery-track");
  const gallerySlides = Array.from(document.querySelectorAll(".gallery-slide"));
  let currentGallery = 0;
  let galleryTimer;
  let dragStart = 0;
  let isDragging = false;

  function showGallerySlide(index) {
    if (!galleryStage || !galleryTrack || !gallerySlides.length) {
      return;
    }

    currentGallery = (index + gallerySlides.length) % gallerySlides.length;
    gallerySlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentGallery);
      slide.setAttribute("aria-hidden", String(slideIndex !== currentGallery));
    });

    const active = gallerySlides[currentGallery];
    const stageCenter = galleryStage.clientWidth / 2;
    const activeCenter = active.offsetLeft + active.offsetWidth / 2;
    galleryTrack.style.transform = `translateX(${stageCenter - activeCenter}px)`;
  }

  function startGalleryAutoplay() {
    if (!gallerySlides.length) {
      return;
    }
    clearInterval(galleryTimer);
    galleryTimer = setInterval(() => showGallerySlide(currentGallery + 1), 7000);
  }

  if (galleryStage && galleryTrack && gallerySlides.length) {
    document.querySelector(".gallery-control.prev")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearInterval(galleryTimer);
      showGallerySlide(currentGallery - 1);
      startGalleryAutoplay();
    });

    document.querySelector(".gallery-control.next")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearInterval(galleryTimer);
      showGallerySlide(currentGallery + 1);
      startGalleryAutoplay();
    });

    galleryStage.addEventListener("mouseenter", () => clearInterval(galleryTimer));
    galleryStage.addEventListener("mouseleave", startGalleryAutoplay);

    galleryStage.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".gallery-control")) {
        return;
      }
      isDragging = true;
      dragStart = event.clientX;
      galleryStage.classList.add("is-dragging");
      galleryStage.setPointerCapture(event.pointerId);
      clearInterval(galleryTimer);
    });

    galleryStage.addEventListener("pointerup", (event) => {
      if (!isDragging) {
        return;
      }
      const distance = event.clientX - dragStart;
      galleryStage.classList.remove("is-dragging");
      isDragging = false;
      if (Math.abs(distance) > 45) {
        showGallerySlide(currentGallery + (distance < 0 ? 1 : -1));
      }
      startGalleryAutoplay();
    });

    galleryStage.addEventListener("pointercancel", () => {
      isDragging = false;
      galleryStage.classList.remove("is-dragging");
      startGalleryAutoplay();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        showGallerySlide(currentGallery - 1);
        startGalleryAutoplay();
      }
      if (event.key === "ArrowRight") {
        showGallerySlide(currentGallery + 1);
        startGalleryAutoplay();
      }
    });

    window.addEventListener("resize", () => showGallerySlide(currentGallery));
    showGallerySlide(0);
    startGalleryAutoplay();
  }

  // Seating plan elements and logic first to avoid ReferenceErrors during concierge initialization
  const prefSelect = document.querySelector("#diningPreference");
  const walkInCheck = document.querySelector("#walkInCheckbox");
  const floorplan = document.querySelector("#restaurantFloorplan");
  const seatButtons = document.querySelectorAll(".seat");
  const seatInput = document.querySelector("#selectedSeatInput");
  const areaInput = document.querySelector("#selectedAreaInput");
  const dateInput = document.querySelector("#reservationDate");
  const timeSelect = document.querySelector("#reservationTime");

  const confirmSeatModal = document.querySelector("#confirmSeatModal");
  const confirmMsg = document.querySelector("#confirmSeatMessage");
  const confirmBtn = document.querySelector("#confirmSeatBtn");
  const cancelBtn = document.querySelector("#cancelSeatBtn");

  const recWarningModal = document.querySelector("#recommendationWarningModal");
  const continueBtn = document.querySelector("#continueChoiceBtn");
  const selectRecBtn = document.querySelector("#selectRecommendedBtn");

  const occupiedWarningModal = document.querySelector("#occupiedWarningModal");
  const nextBestSeatBtn = document.querySelector("#nextBestSeatBtn");
  const chooseAnotherOccupiedBtn = document.querySelector("#chooseAnotherOccupiedBtn");
  const walkInOccupiedBtn = document.querySelector("#walkInOccupiedBtn");

  let pendingSeatId = "";
  let pendingSeatArea = "";

  const recommendations = {
    romantic: ["P1-1", "P1-2", "P2-1", "P2-2", "V1-1", "V1-2", "V2-1", "V2-2"],
    family: ["R2-1", "R2-2", "R2-3", "R2-4", "P1-3", "P1-4", "P2-3", "P2-4"],
    window: ["W1-1", "W1-2", "W2-1", "W2-2", "W3-1", "W3-2"],
    quiet: ["V1-3", "V1-4", "V2-3", "V2-4", "R3-1", "R3-2", "R4-1", "R4-2"],
    music: ["P2-1", "P2-2", "P2-3", "P2-4", "R2-1", "R2-2"],
    premium: ["P1-1", "P1-2", "P1-3", "P1-4", "P2-1", "P2-2", "P2-3", "P2-4", "V1-1", "V1-2", "V1-3", "V1-4", "V2-1", "V2-2", "V2-3", "V2-4"],
    none: []
  };

  const allSeatsList = [
    "W1-1", "W1-2", "W2-1", "W2-2", "W3-1", "W3-2",
    "P1-1", "P1-2", "P1-3", "P1-4", "P2-1", "P2-2", "P2-3", "P2-4",
    "V1-1", "V1-2", "V1-3", "V1-4", "V2-1", "V2-2", "V2-3", "V2-4",
    "R1-1", "R1-2", "R3-1", "R3-2", "R4-1", "R4-2",
    "R2-1", "R2-2", "R2-3", "R2-4"
  ];

  // Initialize default bookings if empty
  if (!localStorage.getItem("gourmet_bookings")) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const defaultBookings = [
      {
        name: "Lady Penelope",
        phone: "+91 99999 88888",
        date: formattedDate,
        time: "19:00",
        seat_id: "W1-1",
        dining_area: "Window-Side Seating",
        notes: "Anniversary dinner."
      },
      {
        name: "Lord Sterling",
        phone: "+91 88888 77777",
        date: formattedDate,
        time: "20:00",
        seat_id: "P1-1",
        dining_area: "Premium Dining",
        notes: "Business discussion."
      }
    ];
    localStorage.setItem("gourmet_bookings", JSON.stringify(defaultBookings));
  }

  function getOccupiedSeats(dateVal, timeVal) {
    if (!dateVal || !timeVal) return [];
    let bookings = [];
    try {
      bookings = JSON.parse(localStorage.getItem("gourmet_bookings") || "[]");
    } catch (e) {
      bookings = [];
    }
    return bookings
      .filter(b => b.date === dateVal && b.time === timeVal && b.seat_id !== "Walk-In")
      .map(b => b.seat_id);
  }

  function updateOccupiedSeats() {
    const dVal = dateInput?.value || "";
    const tVal = timeSelect?.value || "";
    const occupiedList = getOccupiedSeats(dVal, tVal);

    seatButtons.forEach((btn) => {
      const sId = btn.getAttribute("data-seat-id");
      if (occupiedList.includes(sId)) {
        btn.classList.add("occupied");
        btn.classList.remove("recommended", "selected");
        btn.removeAttribute("aria-checked");
      } else {
        btn.classList.remove("occupied");
      }
    });

    const currentSelectedSeat = seatInput?.value;
    if (currentSelectedSeat && occupiedList.includes(currentSelectedSeat)) {
      seatButtons.forEach(btn => btn.classList.remove("selected"));
      if (seatInput) seatInput.value = "";
      if (areaInput) areaInput.value = "";
      occupiedWarningModal?.classList.add("show");
    }

    updateRecommendations();
  }

  function updateAvailableTimeSlots() {
    const dVal = dateInput?.value || "";
    if (!dVal || !timeSelect) return;

    const date = selectedDate(dVal);
    if (!date) return;

    const hours = operatingHoursFor(date);

    Array.from(timeSelect.options).forEach((opt) => {
      if (!opt.value) return; // Skip placeholder option
      const mins = timeToMinutes(opt.value);
      if (mins !== null && (mins < hours.open || mins > hours.close)) {
        opt.disabled = true;
        opt.style.display = "none";
      } else {
        opt.disabled = false;
        opt.style.display = "";
      }
    });

    // If the currently selected option is now disabled, reset it
    const selectedOpt = timeSelect.options[timeSelect.selectedIndex];
    if (selectedOpt && selectedOpt.disabled) {
      timeSelect.value = "";
    }
  }

  function updateRecommendations() {
    if (walkInCheck?.checked) return;

    const pref = prefSelect?.value || "none";
    const recommendedList = recommendations[pref] || [];

    seatButtons.forEach((btn) => {
      const sId = btn.getAttribute("data-seat-id");
      const isOccupied = btn.classList.contains("occupied");

      if (recommendedList.includes(sId) && !isOccupied) {
        btn.classList.add("recommended");
      } else {
        btn.classList.remove("recommended");
      }
    });
  }

  dateInput?.addEventListener("change", () => {
    updateAvailableTimeSlots();
    updateOccupiedSeats();
  });
  timeSelect?.addEventListener("change", updateOccupiedSeats);
  prefSelect?.addEventListener("change", updateRecommendations);

  // Concierge elements and logic second
  const reservationConcierge = document.querySelector(".table-concierge");
  const tableRecommendation = document.querySelector(".table-recommendation");

  const tablePlans = {
    romantic: {
      window: ["Table W1 (Window-Side)", "Soft candlelight, street-level sparkle, and premium views."],
      corner: ["Table V1 (Private Booth)", "A tucked-away luxury booth with the room's best low light."],
      chef: ["Table P1 (Premium)", "Close enough to feel the kitchen's rhythm while keeping the evening intimate."],
      quiet: ["Table R3 (Quiet Corner)", "Our calmest table, ideal for slow wine and unhurried conversation."]
    },
    celebration: {
      window: ["Table W2 (Window-Side)", "Bright enough for the first toast, still elegant after the second."],
      corner: ["Table V2 (Private Booth)", "A little dramatic, a little private, and very ready for champagne."],
      chef: ["Table P2 (Premium)", "For guests who want the first glimpse when the special plate leaves the pass."],
      quiet: ["Table R2 (Premium)", "Celebratory without becoming a parade."]
    },
    business: {
      window: ["Table W3 (Window-Side)", "Clear light, confident spacing, and discreet conversation."],
      corner: ["Table R2 (Premium)", "No one has to shout. Everyone looks prepared."],
      chef: ["Table P1 (Premium)", "A little theatre, just enough to make the dinner memorable."],
      quiet: ["Table V1 (Private Booth)", "Our most composed table for focused conversation."]
    },
    quiet: {
      window: ["Table W1 (Window-Side)", "Gentle light, fewer interruptions, and a persuasive dessert view."],
      corner: ["Table R3 (Quiet Corner)", "For slow conversation, warm bread, and pretending the world can wait."],
      chef: ["Table P2 (Premium)", "Comforting, lively, and close to the good aromas."],
      quiet: ["Table V2 (Private Booth)", "The calmest seat in the room."]
    }
  };

  const dishPlans = {
    vegetarian: ["Truffle Risotto", "Chilled Sancerre"],
    seafood: ["Butter-Poached Lobster Tail", "Mineral white Burgundy"],
    steak: ["Filet Mignon", "Left Bank Bordeaux"],
    dessert: ["Berry Panna Cotta", "Late-harvest Riesling"]
  };

  function checkedValue(form, name) {
    return form?.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function updateReservationConcierge() {
    if (!reservationConcierge || !tableRecommendation) {
      return;
    }

    const occasion = checkedValue(reservationConcierge, "occasion") || "romantic";
    const seat = checkedValue(reservationConcierge, "seat") || "window";
    const taste = checkedValue(reservationConcierge, "taste") || "vegetarian";
    const [tableName, reason] = tablePlans[occasion][seat];
    const [dish, pairing] = dishPlans[taste];
    const note = `Please prepare ${tableName.toLowerCase()} with a ${occasion} pace of service. Begin with ${dish}.`;

    tableRecommendation.querySelector("h3").textContent = tableName;
    tableRecommendation.querySelector(".table-reason").textContent = reason;
    tableRecommendation.querySelector("ul").innerHTML = `
      <li><strong>Start with:</strong> ${dish}</li>
      <li><strong>Pairing:</strong> ${pairing}</li>
      <li><strong>Reservation note:</strong> ${note}</li>
    `;

    const notes = document.querySelector("#reservationNotes");
    if (notes && !notes.dataset.touched) {
      notes.placeholder = note;
    }

    const preferenceDropdown = document.querySelector("#diningPreference");
    if (preferenceDropdown) {
      if (occasion === "romantic") preferenceDropdown.value = "romantic";
      else if (occasion === "celebration") preferenceDropdown.value = "premium";
      else if (occasion === "business") preferenceDropdown.value = "premium";
      else if (occasion === "quiet") preferenceDropdown.value = "quiet";
      
      updateRecommendations();
    }
  }

  reservationConcierge?.addEventListener("change", updateReservationConcierge);
  updateReservationConcierge();

  document.querySelector("#reservationNotes")?.addEventListener("input", (event) => {
    event.currentTarget.dataset.touched = "true";
  });

  walkInCheck?.addEventListener("change", () => {
    if (walkInCheck.checked) {
      floorplan?.classList.add("disabled");
      seatButtons.forEach((btn) => btn.classList.remove("selected"));
      if (seatInput) seatInput.value = "Walk-In";
      if (areaInput) areaInput.value = "Upon Arrival";
      const errEl = document.querySelector('[data-error-for="selectedSeatInput"]');
      if (errEl) errEl.textContent = "";
    } else {
      floorplan?.classList.remove("disabled");
      if (seatInput) seatInput.value = "";
      if (areaInput) areaInput.value = "";
    }
  });

  seatButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const sId = btn.getAttribute("data-seat-id");
      const sArea = btn.getAttribute("data-area");
      const isOccupied = btn.classList.contains("occupied");

      if (isOccupied) {
        pendingSeatId = sId;
        pendingSeatArea = sArea;
        occupiedWarningModal?.classList.add("show");
        return;
      }

      pendingSeatId = sId;
      pendingSeatArea = sArea;

      const pref = prefSelect?.value || "none";
      const recommendedList = recommendations[pref] || [];

      if (pref !== "none" && recommendedList.length > 0 && !recommendedList.includes(sId)) {
        recWarningModal?.classList.add("show");
      } else {
        if (confirmMsg) {
          confirmMsg.textContent = `Are you sure you would like to reserve Seat ${sId}?`;
        }
        confirmSeatModal?.classList.add("show");
      }
    });
  });

  confirmBtn?.addEventListener("click", () => {
    seatButtons.forEach((btn) => {
      if (btn.getAttribute("data-seat-id") === pendingSeatId) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });

    if (seatInput) seatInput.value = pendingSeatId;
    if (areaInput) areaInput.value = pendingSeatArea;
    if (walkInCheck) walkInCheck.checked = false;
    floorplan?.classList.remove("disabled");

    const errEl = document.querySelector('[data-error-for="selectedSeatInput"]');
    if (errEl) errEl.textContent = "";

    confirmSeatModal?.classList.remove("show");
  });

  cancelBtn?.addEventListener("click", () => {
    confirmSeatModal?.classList.remove("show");
  });

  continueBtn?.addEventListener("click", () => {
    recWarningModal?.classList.remove("show");
    if (confirmMsg) {
      confirmMsg.textContent = `Are you sure you would like to reserve Seat ${pendingSeatId}?`;
    }
    confirmSeatModal?.classList.add("show");
  });

  selectRecBtn?.addEventListener("click", () => {
    recWarningModal?.classList.remove("show");
    const recommendedSeats = document.querySelectorAll(".seat.recommended");
    recommendedSeats.forEach((seat) => {
      seat.style.transform = "scale(1.25)";
      setTimeout(() => {
        seat.style.transform = "";
      }, 800);
    });
  });

  chooseAnotherOccupiedBtn?.addEventListener("click", () => {
    occupiedWarningModal?.classList.remove("show");
  });

  walkInOccupiedBtn?.addEventListener("click", () => {
    occupiedWarningModal?.classList.remove("show");
    if (walkInCheck) walkInCheck.checked = true;
    floorplan?.classList.add("disabled");
    seatButtons.forEach((btn) => btn.classList.remove("selected"));
    if (seatInput) seatInput.value = "Walk-In";
    if (areaInput) areaInput.value = "Upon Arrival";
    const errEl = document.querySelector('[data-error-for="selectedSeatInput"]');
    if (errEl) errEl.textContent = "";
  });

  nextBestSeatBtn?.addEventListener("click", () => {
    occupiedWarningModal?.classList.remove("show");
    
    const pref = prefSelect?.value || "none";
    const recommendedList = recommendations[pref] || [];
    let targetSeatBtn = null;

    for (let sId of recommendedList) {
      const btn = Array.from(seatButtons).find(b => b.getAttribute("data-seat-id") === sId);
      if (btn && !btn.classList.contains("occupied")) {
        targetSeatBtn = btn;
        break;
      }
    }

    if (!targetSeatBtn) {
      targetSeatBtn = Array.from(seatButtons).find(btn => !btn.classList.contains("occupied"));
    }

    if (targetSeatBtn) {
      pendingSeatId = targetSeatBtn.getAttribute("data-seat-id");
      pendingSeatArea = targetSeatBtn.getAttribute("data-area");
      if (confirmMsg) {
        confirmMsg.textContent = `Are you sure you would like to reserve Seat ${pendingSeatId}?`;
      }
      confirmSeatModal?.classList.add("show");
    } else {
      alert("All seats are fully booked for this slot. Please choose another time or select Walk-In.");
    }
  });

  updateAvailableTimeSlots();
  updateOccupiedSeats();
});

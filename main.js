const backedAmountEl = document.getElementById("backed-amount");
const backersEl = document.getElementById("numberBackers");

// Mobile Menu
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const menuIcon = menuToggle.querySelector("img");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

  if (isExpanded) {
    menuIcon.src = "./images/icon-hamburger.svg";
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open mobile navigation menu");
    mainNav.hidden = true;
    toggleOverlay(false);
  } else {
    menuIcon.src = "./images/icon-close-menu.svg";
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close mobile navigation menu");
    mainNav.hidden = false;
    toggleOverlay(true);
  }
});

// Overlay
const overlay = document.getElementById("overlay");

function toggleOverlay(show) {
  overlay.hidden = !show;

  if (show) {
    document.body.classList.add("noscroll");
  } else {
    document.body.classList.remove("noscroll");
  }
}

// Bookmark
const bookmarkBtn = document.getElementById("bookmarkProject");

bookmarkBtn.addEventListener("click", () => {
  bookmarkBtn.classList.toggle("bookmarked");

  const isPressed = bookmarkBtn.getAttribute("aria-pressed") === "true";
  bookmarkBtn.setAttribute("aria-pressed", !isPressed);
});

// Progress Bar
const progressBar = document.getElementById("progress-bar");

let backedAmount = parseInt(
  backedAmountEl.textContent.replace(/[$,]/g, ""),
  10
);

const goal = 100000;

const progressPercent = (backedAmount / goal) * 100;

progressBar.style.width = progressPercent + "%";

// Check availability
updateRewardAvailability();

function updateRewardAvailability() {
  document.querySelectorAll(".reward-group").forEach((group) => {
    const quantityEl = group.querySelector(".quantity span");
    const radio = group.querySelector(".reward-radio");

    if (quantityEl && radio) {
      const quantity = parseInt(quantityEl.textContent.trim(), 10);

      if (quantity <= 0) {
        radio.disabled = true;
        group.classList.add("disabled");
      } else {
        radio.disabled = false;
        group.classList.remove("disabled");
      }
    }
  });

  document.querySelectorAll("article").forEach((article) => {
    const quantityEl = article.querySelector(".article-quantity span");
    const btn = article.querySelector(".selectReward");

    if (quantityEl && btn) {
      const quantity = parseInt(quantityEl.textContent.trim(), 10);

      if (quantity <= 0) {
        article.classList.add("out-of-stock");
        btn.disabled = true;
        btn.textContent = "Out of Stock";
      } else {
        article.classList.remove("out-of-stock");
        btn.disabled = false;
        btn.textContent = "Select Reward";
      }
    }
  });
}

// Input Event Listener
document.querySelectorAll(".pledge-input").forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");

    const min = parseInt(input.getAttribute("min") || "1", 10);
    if (input.value && parseInt(input.value, 10) < min) {
      input.value = min;
    }
  });

  input.addEventListener("keydown", (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  });
});

// Accept Pledges and Update progress

document.querySelectorAll(".pledge-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    const group = btn.closest(".reward-group");
    const rewardRadio = group.querySelector(".reward-radio:checked");
    if (!rewardRadio) return;

    const rewardKey = rewardRadio.value;
    const min = parseInt(rewardRadio.dataset.min, 10);

    const input = group.querySelector(".pledge-input");
    let pledgeAmountRaw = input.value.trim();
    let pledgeAmount = Number(pledgeAmountRaw);

    // Validation
    if (!Number.isInteger(pledgeAmount) || pledgeAmount < min) {
      input.value = min;
      return;
    }

    // Update totals
    let currentTotal = parseInt(
      backedAmountEl.textContent.replace(/,/g, ""),
      10
    );
    currentTotal += pledgeAmount;
    backedAmountEl.textContent = currentTotal.toLocaleString();

    let currentBackers = parseInt(backersEl.textContent.replace(/,/g, ""), 10);
    currentBackers += 1;
    backersEl.textContent = currentBackers.toLocaleString();

    // Update quantity in modal
    const modalQtyEl = group.querySelector(".quantity span");
    if (modalQtyEl) {
      let currentQty = parseInt(modalQtyEl.textContent.trim(), 10);
      if (currentQty > 0) {
        currentQty -= 1;
        modalQtyEl.textContent = currentQty;

        // Mirror quantity on the main page
        const pageQtyEl = document.querySelector(`#${rewardKey}Qty`);
        if (pageQtyEl) {
          pageQtyEl.textContent = currentQty;
        }
      }
    }

    // Update progress bar
    const progressPercent = (currentTotal / goal) * 100;
    progressBar.style.width = progressPercent + "%";

    updateRewardAvailability();

    showSuccessMessage();
  });
});

// Open modal Default
document
  .getElementById("backThisProject")
  .addEventListener("click", openDefaultModal);

//   Open modal with Reward
document.querySelectorAll(".selectReward").forEach((btn) => {
  btn.addEventListener("click", () => openModalWithReward(btn.dataset.reward));
});

// Close Modal X
const closeX = document.getElementById("closeModal");

closeX.addEventListener("click", () => {
  closeModal();
});

// Close Modal Got It
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
  closeModal();
});

// Helper Functions
function openDefaultModal() {
  const modal = document.getElementById("pledgeModal");
  modal.hidden = false;

  document.querySelectorAll(".reward-radio").forEach((radio) => {
    radio.checked = false;
  });

  document.querySelectorAll(".reward-group").forEach((group) => {
    group.classList.remove("active");
    const input = group.querySelector(".pledge-input");
    if (input) input.value = "";
  });

  toggleOverlay(true);
}

function openModalWithReward(rewardKey) {
  const modal = document.getElementById("pledgeModal");
  modal.hidden = false;

  document
    .querySelectorAll(".reward-radio")
    .forEach((r) => (r.checked = false));
  document
    .querySelectorAll(".reward-group")
    .forEach((g) => g.classList.remove("active"));
  document
    .querySelectorAll("article")
    .forEach((a) => a.classList.remove("active"));

  const radio = document.querySelector(`.reward-radio[value="${rewardKey}"]`);
  if (radio) {
    radio.checked = true;
    togglePledgeForm(radio);
  }

  const article = document.querySelector(`article[data-reward="${rewardKey}"]`);
  if (article) {
    article.classList.add("active");
  }
  toggleOverlay(true);
}

function closeModal() {
  const modal = document.getElementById("pledgeModal");
  modal.hidden = true;
  resetModal();

  document.querySelectorAll("article").forEach((article) => {
    article.classList.remove("active");
  });
  toggleOverlay(false);
}

function showSuccessMessage() {
  const modalEl = document.getElementById("pledgeModal");
  const modalContent = document.querySelector(".modal-content-wrapper");
  const modalSuccess = document.querySelector(".modal-success");

  modalContent.hidden = true;
  modalSuccess.hidden = false;
  modalEl.classList.add("ok");
}

function resetModal() {
  const modalEl = document.getElementById("pledgeModal");
  const modalContent = document.querySelector(".modal-content-wrapper");
  const modalSuccess = document.querySelector(".modal-success");

  modalContent.hidden = false;
  modalSuccess.hidden = true;
  modalEl.classList.remove("ok");
}

function togglePledgeForm(radio) {
  if (!radio) return;

  document.querySelectorAll(".reward-group").forEach((group) => {
    group.classList.remove("active");
  });

  const group = radio.closest(".reward-group");
  group.classList.add("active");

  const input = group.querySelector(".pledge-input");
  if (input) {
    const min = radio.dataset.min || "";
    input.value = min;
    input.focus();
  }
}

// Attach change listener to all radios
const rewardRadios = document.querySelectorAll(".reward-radio");

rewardRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    togglePledgeForm(radio);
  });
});

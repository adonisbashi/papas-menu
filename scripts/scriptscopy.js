// --- DATA CONFIGURATION ---

// Define each item available for catering with quantity logic per type.
// Each item has a "type" that affects how it’s calculated: 'tray', 'pizza', or 'portion'.
const cateringItems = {
  salad: {
    type: 'tray',
    half: { serves: 10, price: 30 },
    full: { serves: 20, price: 50 },
  },
  breadsticks: {
    type: 'tray',
    half: { serves: 16, price: 10 },
    full: { serves: 32, price: 20 },
  },
  mostaccioli: {
    type: 'tray',
    half: { serves: 10, price: 30 },
    full: { serves: 20, price: 55 },
  },
  lasagna: {
    type: 'tray',
    half: { serves: 10, price: 35 },
    full: { serves: 20, price: 65 },
  },
  fries: {
    type: 'tray',
    half: { serves: 10, price: 10 },
    full: { serves: 20, price: 20 },
  },
  pizza: {
    type: 'pizza',
    options: {
      oneTopping: { label: '1-Topping', price: 12, percentage: 0.4 },
      specialty: { label: 'Specialty', price: 18, percentage: 0.4 },
      superSpecialty: { label: 'Super Specialty', price: 22, percentage: 0.2 },
    },
    slicesPerPizza: 10,
    slicesPerGuest: 2,
  },
  wings: {
    type: 'portion',
    piecesPerOrder: 10,
    piecesPerGuest: 3,
    pricePerOrder: 12,
  },
  tenders: {
    type: 'portion',
    piecesPerOrder: 5,
    piecesPerGuest: 2,
    pricePerOrder: 15,
  },
  cookies: {
    type: 'portion',
    piecesPerOrder: 6,
    piecesPerGuest: 1,
    pricePerOrder: 7,
  },
};

// Party type modifies guest count to account for appetite differences
const partyTypeModifiers = {
  party: 0.75,
  corporate: 0.6,
  pizza: 1,
  kids: 0.7,
};

// Defines which catering items show depending on the selected party type
const partyTypeItems = {
  party: ['pizza', 'breadsticks', 'wings', 'salad', 'cookies'],
  corporate: [
    'pizza',
    'breadsticks',
    'wings',
    'salad',
    'mostaccioli',
    'lasagna',
    'fries',
  ],
  pizza: ['pizza', 'breadsticks', 'salad'],
  kids: ['pizza', 'breadsticks', 'cookies', 'fries', 'tenders'],
};

// --- UI ELEMENT REFERENCES ---

const partyRadios = document.querySelectorAll('input[name="party-type"]'); // radio buttons
const itemValues = document.querySelectorAll('.item-value'); // output spans
const slider = document.getElementById('guest-slider'); // guest range input
const label = document.getElementById('slider-label'); // label above slider
const thumbNumber = document.getElementById('slider-thumb-number'); // number inside thumb

function startDragging() {
  document.body.classList.add('slider-grabbing');
  slider.classList.add('dragging');
}

function stopDragging() {
  document.body.classList.remove('slider-grabbing');
  slider.classList.remove('dragging');
}

// Updates slider UI position and value labels
function updateSliderUI() {
  const sliderWidth = slider.offsetWidth;
  const thumbWidth = 40;
  const min = +slider.min;
  const max = +slider.max;
  const val = +slider.value;

  const percent = (val - min) / (max - min);
  const offset = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

  label.style.left = `${offset}px`;
  thumbNumber.style.left = `${offset}px`;
  label.textContent = val;
  thumbNumber.textContent = val;

  calculateRecommendations();
}

slider.addEventListener('pointerdown', startDragging);
slider.addEventListener('pointerup', stopDragging);
document.addEventListener('pointerup', stopDragging);

slider.addEventListener('mousedown', startDragging);
slider.addEventListener('mouseup', stopDragging);
document.addEventListener('mouseup', stopDragging);

slider.addEventListener('input', () => {
  updateSliderUI(); // This still updates label position and text
});

// Optional safety: make sure it's hidden on load
document.addEventListener('DOMContentLoaded', () => {
  label.classList.remove('active');
});

// When radio selection changes, recalculate
partyRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    calculateRecommendations();
  });
});

// When slider moves, update values
slider.addEventListener('input', updateSliderUI);
window.addEventListener('load', updateSliderUI);
window.addEventListener('resize', updateSliderUI);

// Returns multiplier based on selected party type
function getPartyTypeModifier() {
  const selected = document.querySelector('input[name="party-type"]:checked');
  if (!selected) return 1;
  const type = selected.value;
  return partyTypeModifiers[type] || 1;
}

// Hides irrelevant items based on selected party type
function updateVisibleItems(allowedItems) {
  const allElements = document.querySelectorAll('.catering-calculator-item');

  allElements.forEach((el) => {
    const id = el.querySelector('.item-value')?.id;
    if (!id) return;
    const key = id.replace('-value', '');
    el.style.display = 'flex';

    if (!allowedItems.includes(key)) {
      el.querySelector('.item-value').innerHTML = '0';
      el.querySelector('.item-value').classList.remove('highlight');
    }
  });
}

// Core function: calculates what to order based on guests & party type
function calculateRecommendations() {
  const guestCount = parseInt(slider.value);
  const modifier = getPartyTypeModifier();
  const adjustedGuests = Math.ceil(guestCount * modifier);

  const selectedType =
    document.querySelector('input[name="party-type"]:checked')?.value ||
    'party';
  const allowedItems =
    partyTypeItems[selectedType] || Object.keys(cateringItems);

  updateVisibleItems(allowedItems);

  const recommendations = {};

  for (const item of allowedItems) {
    const config = cateringItems[item];
    const guestBasis = config.type === 'pizza' ? guestCount : adjustedGuests;

    switch (config.type) {
      case 'tray':
        let rem = guestBasis;
        let fullQty = Math.floor(rem / config.full.serves);
        rem -= fullQty * config.full.serves;

        let halfQty = 0;
        if (rem > 0) {
          const halfTrayServes = config.half.serves;
          const neededHalfTrays = Math.ceil(rem / halfTrayServes);
          if (neededHalfTrays > 1) {
            fullQty += 1;
          } else {
            halfQty = 1;
          }
        }

        let label = '';

        if (fullQty === 0 && halfQty === 0) {
          label = '0';
        } else {
          const parts = [];

          if (fullQty > 0) {
            parts.push(
              `<span class="tray-count">${fullQty}</span> <span class="tray-size full">Full</span>`
            );
          }

          if (halfQty > 0) {
            parts.push(
              `<span class="tray-count">${halfQty}</span> <span class="tray-size half">Half</span>`
            );
          }

          label = `<div class="tray-label">${parts.join(' + ')}</div>`;
        }

        recommendations[item] = {
          label,
          totalServes:
            fullQty * config.full.serves + halfQty * config.half.serves,
          totalCost: fullQty * config.full.price + halfQty * config.half.price,
        };

        break;

      case 'pizza':
        const pizzaConfig = config;
        const totalSlicesNeeded = guestBasis * pizzaConfig.slicesPerGuest;
        const totalPizzas = Math.ceil(
          totalSlicesNeeded / pizzaConfig.slicesPerPizza
        );

        const pizzaBreakdown = {};
        let totalCost = 0;
        let rawCounts = {};
        let runningTotal = 0;

        // Step 1: Calculate base count for each pizza type
        for (const option in pizzaConfig.options) {
          const count = Math.floor(
            totalPizzas * pizzaConfig.options[option].percentage
          );
          rawCounts[option] = count;
          runningTotal += count;
        }

        // Step 2: Add extra pizzas to reach total
        while (runningTotal < totalPizzas) {
          rawCounts['oneTopping'] += 1;
          runningTotal += 1;
        }

        for (const option in pizzaConfig.options) {
          const type = pizzaConfig.options[option];
          pizzaBreakdown[option] = {
            label: type.label,
            count: rawCounts[option],
            cost: rawCounts[option] * type.price,
          };
          totalCost += rawCounts[option] * type.price;
        }

        let pizzaLabel = Object.values(pizzaBreakdown)
          .map((p) => `<div class="pizza-line">${p.count} ${p.label}</div>`)
          .join('');

        recommendations[item] = {
          label: pizzaLabel,
          totalServes: totalPizzas * pizzaConfig.slicesPerPizza,
          totalCost: totalCost,
        };
        break;

      case 'portion':
        if (item === 'wings') {
          const totalPieces = guestBasis * config.piecesPerGuest;
          const roundedPieces = Math.ceil(totalPieces / 5) * 5;
          const pricePerWing = config.pricePerOrder / config.piecesPerOrder;
          const totalCost = roundedPieces * pricePerWing;

          recommendations[item] = {
            label: `${roundedPieces}`,
            totalServes: roundedPieces,
            totalCost: totalCost,
          };
        } else if (config.piecesPerGuest) {
          const totalPieces = guestBasis * config.piecesPerGuest;
          const ordersNeeded = Math.ceil(totalPieces / config.piecesPerOrder);

          recommendations[item] = {
            label: `${ordersNeeded}`,
            totalServes: ordersNeeded * config.piecesPerOrder,
            totalCost: ordersNeeded * config.pricePerOrder,
          };
        } else if (config.guestsPerOrder) {
          const ordersNeeded = Math.ceil(guestBasis / config.guestsPerOrder);

          recommendations[item] = {
            label: `${ordersNeeded} Orders`,
            totalServes: ordersNeeded * config.guestsPerOrder,
            totalCost: ordersNeeded * config.pricePerOrder,
          };
        }
        break;
    }
  }

  updateUIWithRecommendations(recommendations);

  // Calculates the total price for all items
  let totalPrice = 0;

  for (const rec of Object.values(recommendations)) {
    totalPrice += rec.totalCost || 0;
  }

  const totalPriceEl = document.getElementById('total-price');
  if (totalPriceEl) {
    totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
  }
}

// Render each label into the appropriate spot in the UI
function updateUIWithRecommendations(recommendations) {
  for (const item in recommendations) {
    const element = document.getElementById(`${item}-value`);
    element.innerHTML = recommendations[item].label;
  }
}

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
      oneTopping: {
        label: '1-Topping',
        price: 12,
        percentage: 0.4,
      },
      specialty: {
        label: 'Specialty',
        price: 18,
        percentage: 0.4,
      },
      superSpecialty: {
        label: 'Super Specialty',
        price: 22,
        percentage: 0.2,
      },
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

const partyTypeModifiers = {
  party: 0.75,
  loaded: 0.6,
  pizza: 1,
  kids: 0.7,
};

const partyTypeItems = {
  party: ['pizza', 'breadsticks', 'wings', 'salad', 'cookies'],
  loaded: [
    'pizza',
    'breadsticks',
    'wings',
    'tenders',
    'salad',
    'mostaccioli',
    'lasagna',
    'fries',
  ],
  pizza: ['pizza', 'breadsticks', 'salad'],
  kids: ['pizza', 'breadsticks', 'cookies', 'fries', 'tenders'],
};

// This grabs all the party type radio buttons
const partyRadios = document.querySelectorAll('input[name="party-type"]');

// This grabs all the item value elements
const itemValues = document.querySelectorAll('.item-value');

const slider = document.getElementById('guest-slider');
const label = document.getElementById('slider-label');
const thumbNumber = document.getElementById('slider-thumb-number');

function updateSliderUI() {
  const sliderWidth = slider.offsetWidth;
  const thumbWidth = 40;
  const min = +slider.min;
  const max = +slider.max;
  const val = +slider.value;

  const percent = (val - min) / (max - min);
  const offset = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

  // Position both above bubble and inside-thumb label
  label.style.left = `${offset}px`;
  thumbNumber.style.left = `${offset}px`;
  label.textContent = val;
  thumbNumber.textContent = val;

  calculateRecommendations();
}

partyRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    calculateRecommendations();
  });
});

slider.addEventListener('input', updateSliderUI);
window.addEventListener('load', updateSliderUI);

function getPartyTypeModifier() {
  const selected = document.querySelector('input[name="party-type"]:checked');
  if (!selected) return 1;

  const type = selected.value;
  return partyTypeModifiers[type] || 1;
}

function updateVisibleItems(allowedItems) {
  const allElements = document.querySelectorAll('.catering-calculator-item');

  allElements.forEach((el) => {
    const id = el.querySelector('.item-value')?.id;
    if (!id) return;

    const key = id.replace('-value', '');
    el.style.display = 'flex'; // always visible

    // Reset all to 0 by default
    if (!allowedItems.includes(key)) {
      el.querySelector('.item-value').innerHTML = '0';
      el.querySelector('.item-value').classList.remove('highlight');
    }
  });
}

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

        recommendations[item] = {
          label:
            halfQty === 0
              ? `${fullQty} Full`
              : fullQty === 0
              ? `${halfQty} Half`
              : `${fullQty} Full + ${halfQty} Half`,
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

        for (const option in pizzaConfig.options) {
          const pizzaType = pizzaConfig.options[option];
          // Step 1: calculate raw counts
          const rawCounts = {};
          let runningTotal = 0;

          for (const option in pizzaConfig.options) {
            const pizzaType = pizzaConfig.options[option];
            const count = Math.floor(totalPizzas * pizzaType.percentage);
            rawCounts[option] = count;
            runningTotal += count;
          }

          // Step 2: top off any missing pizzas to meet the totalPizzas
          while (runningTotal < totalPizzas) {
            // Add one pizza to the most popular type (e.g., oneTopping)
            rawCounts['oneTopping'] += 1;
            runningTotal += 1;
          }

          pizzaBreakdown[option] = {
            label: pizzaType.label,
            count: rawCounts[option],
            cost: rawCounts[option] * pizzaType.price,
          };
        }

        let pizzaLabel = Object.values(pizzaBreakdown)
          .map((p) => `${p.count} × ${p.label}`)
          .join('<br>');

        recommendations[item] = {
          label: pizzaLabel,
          totalServes: totalPizzas * pizzaConfig.slicesPerPizza,
          totalCost: totalCost,
        };
        break;

      case 'portion':
        if (item === 'wings') {
          const totalPieces = guestBasis * config.piecesPerGuest;

          // Round up to nearest multiple of 5
          const roundedPieces = Math.ceil(totalPieces / 5) * 5;

          const pricePerWing = config.pricePerOrder / config.piecesPerOrder;
          const totalCost = roundedPieces * pricePerWing;

          recommendations[item] = {
            label: `${roundedPieces} Wings`,
            totalServes: roundedPieces,
            totalCost: totalCost,
          };
        } else if (config.piecesPerGuest) {
          const totalPieces = guestBasis * config.piecesPerGuest;
          const ordersNeeded = Math.ceil(totalPieces / config.piecesPerOrder);

          recommendations[item] = {
            label: `${ordersNeeded} Orders`,
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

      default:
        break;
    }
  }

  updateUIWithRecommendations(recommendations);
}

function updateUIWithRecommendations(recommendations) {
  for (const item in recommendations) {
    const element = document.getElementById(`${item}-value`);
    element.innerHTML = recommendations[item].label;
  }
}

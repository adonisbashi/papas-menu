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
        label: '1-Topping Pizza',
        price: 12,
        percentage: 0.4,
      },
      specialty: {
        label: 'Specialty Pizza',
        price: 18,
        percentage: 0.4,
      },
      superSpecialty: {
        label: 'Super Specialty Pizza',
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

// This grabs all the party type radio buttons
const partyRadios = document.querySelectorAll('input[name="party-type"]');

// This grabs all the item value elements
const itemValues = document.querySelectorAll('.item-value');

partyRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    calculateRecommendations();
  });
});

slider.addEventListener('input', updateSliderUI);
window.addEventListener('load', updateSliderUI);

function getPartyTypeModifier() {
  const selected = document.querySelector('input[name="party-type"]:checked');
  return 1;
}

function calculateRecommendations() {
  const guestCount = parseInt(slider.value);
  const modifier = getPartyTypeModifier();
  const adjustedGuests = Math.ceil(guestCount * modifier);

  const recommendations = {};

  for (const item in cateringItems) {
    const config = cateringItems[item];

    switch (config.type) {
      case 'tray':
        let rem = adjustedGuests;
        const fullQty = Math.floor(rem / config.full.serves);
        rem -= fullQty * config.full.serves;
        const halfQty = Math.ceil(rem / config.half.serves);

        recommendations[item] = {
          label: `${fullQty} Full + ${halfQty} Half`,
          totalServes:
            fullQty * config.full.serves + halfQty * config.half.serves,
          totalCost: fullQty * config.full.price + halfQty * config.half.price,
        };
        break;

      // case 'pizza':
      //   const totalSlicesNeeded = adjustedGuests * config.slicesPerGuest;
      //   const pizzasNeeded = Math.ceil(
      //     totalSlicesNeeded / config.slicesPerPizza
      //   );

      //   recommendations[item] = {
      //     label: `${pizzasNeeded} Pizzas`,
      //     totalServes: pizzasNeeded * config.slicesPerPizza,
      //     totalCost: pizzasNeeded * config.pricePerPizza,
      //   };
      //   break;

      case 'pizza':
        const pizzaConfig = config;
        const totalSlicesNeeded = adjustedGuests * pizzaConfig.slicesPerGuest;
        const totalPizzas = Math.ceil(
          totalSlicesNeeded / pizzaConfig.slicesPerPizza
        );

        const pizzaBreakdown = {};
        let totalCost = 0;

        for (const option in pizzaConfig.options) {
          const pizzaType = pizzaConfig.options[option];
          const count = Math.ceil(totalPizzas * pizzaType.percentage);

          pizzaBreakdown[option] = {
            label: pizzaType.label,
            count,
            cost: count * pizzaType.price,
          };

          totalCost += count * pizzaType.price;
        }

        let pizzaLabel = Object.values(pizzaBreakdown)
          .map((p) => `${p.count} × ${p.label}`)
          .join(', ');

        recommendations[item] = {
          label: pizzaLabel,
          totalServes: totalPizzas * pizzaConfig.slicesPerPizza,
          totalCost: totalCost,
        };
        break;

      case 'portion':
        if (config.piecesPerGuest) {
          const totalPieces = adjustedGuests * config.piecesPerGuest;
          const ordersNeeded = Math.ceil(totalPieces / config.piecesPerOrder);

          recommendations[item] = {
            label: `${ordersNeeded} Orders`,
            totalServes: ordersNeeded * config.piecesPerOrder,
            totalCost: ordersNeeded * config.pricePerOrder,
          };
        } else if (config.guestsPerOrder) {
          const ordersNeeded = Math.ceil(
            adjustedGuests / config.guestsPerOrder
          );

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
    element.textContent = recommendations[item].label;
  }
}

// const slider = document.getElementById('guest-slider');
// const label = document.getElementById('slider-label');
// const thumbNumber = document.getElementById('slider-thumb-number');

// function updateSliderUI() {
//   const sliderWidth = slider.offsetWidth;
//   const thumbWidth = 40;
//   const min = +slider.min;
//   const max = +slider.max;
//   const val = +slider.value;

//   const percent = (val - min) / (max - min);
//   const offset = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;

//   // Position both above bubble and inside-thumb label
//   label.style.left = `${offset}px`;
//   thumbNumber.style.left = `${offset}px`;
//   label.textContent = val;
//   thumbNumber.textContent = val;

//   calculateRecommendations();
// }

// // This grabs all the party type radio buttons
// const partyRadios = document.querySelectorAll('input[name="party-type"]');

// // This grabs all the item value elements
// const itemValues = document.querySelectorAll('.item-value');

// partyRadios.forEach((radio) => {
//   radio.addEventListener('change', () => {
//     calculateRecommendations();
//   });
// });

// slider.addEventListener('input', updateSliderUI);
// window.addEventListener('load', updateSliderUI);

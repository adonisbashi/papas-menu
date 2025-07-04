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

// This grabs the guest slider and label
const guestSlider = document.getElementById('guest-slider');
const sliderLabel = document.getElementById('slider-label');

// This grabs all the party type radio buttons
const partyRadios = document.querySelectorAll('input[name="party-type"]');

// This grabs all the item value elements
const itemValues = document.querySelectorAll('.item-value');

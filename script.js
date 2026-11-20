const EVENT = {
  mapUrl: 'https://maps.app.goo.gl/kh6TvgdRQW5SgRxw8',
  whatsappNumber: '919137842768'
};

document.querySelectorAll('#map-link, #map-card').forEach(link => {
  link.href = EVENT.mapUrl;
});

const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const details = [
    'Christmas with the Fernandes Family — RSVP',
    `Name: ${data.get('name').trim()}`,
    `Mobile / WhatsApp: ${data.get('contact').trim()}`,
    `Number of people: ${data.get('guests')}`,
    `Staying overnight: ${data.get('overnight')}`,
    data.get('email').trim() ? `Email: ${data.get('email').trim()}` : '',
    data.get('notes').trim() ? `Dietary / accessibility notes: ${data.get('notes').trim()}` : ''
  ].filter(Boolean).join('\n');

  status.textContent = 'WhatsApp is opening with your RSVP. Review the details and tap Send to reserve your spot.';
  const url = `https://wa.me/${EVENT.whatsappNumber}?text=${encodeURIComponent(details)}`;
  window.location.assign(url);
});

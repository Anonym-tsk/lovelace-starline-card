import {StarlineCard} from './ts/StarlineCard';

customElements.define('starline-card', StarlineCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'starline-card',
    name: 'StarLine',
    description: "Amazing card for Starline integration", // Optional
    documentationURL: "https://github.com/Anonym-tsk/lovelace-starline-card",
});

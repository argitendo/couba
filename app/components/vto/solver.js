import * as bracelet2d from './solver2dBracelet';
import * as ring2d from './solver2dRing';
import * as earring2d from './solver2dEarrings';
import * as necklace2d from './solver2dNecklace';

export const getThreeInit = (category) => {
  switch (category) {
    case 'bracelet':
      return bracelet2d.threeInit;

    case 'earring':
      return earring2d.threeInit;

    case 'ring':
      return ring2d.threeInit;

    case 'necklace':
      return necklace2d.threeInit;

    default:
      break;
  }
};

export const rigBracelet = bracelet2d.rigBracelet;
export const rigEarring = earring2d.rigEarring;
export const rigNecklace = necklace2d.rigNecklace;
export const rigRing = ring2d.rigRing;

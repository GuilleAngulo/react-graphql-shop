import { country } from '../config';

export default function(amount) {

  const options = [
    {
      locales: 'en-US',
      option: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      },
    },
    {
      locales: 'pt-BR',
      option: {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      },
    },
    {
      locales:  'es-ES',
      option: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      },
    },
  ];

  const { locales, option } = options.find(option => option.locales === country);

  // if its a whole, dollar amount, leave off the .00
  if (amount % 100 === 0) option.minimumFractionDigits = 0;

  const formatter = new Intl.NumberFormat(locales, option);
  return formatter.format(amount / 100);
};
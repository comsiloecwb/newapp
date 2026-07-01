function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function field(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

export function generatePixPayload(params: {
  key: string;
  name: string;
  city: string;
  amount?: string; // ex: "50.00"
}): string {
  const { key, name, city, amount } = params;

  const pixKey = field('01', key);
  const gui = field('00', 'BR.GOV.BCB.PIX');
  const merchantAccount = field('26', gui + pixKey);
  const mcc = field('52', '0000');
  const currency = field('53', '986');
  const amountField = amount ? field('54', amount) : '';
  const country = field('58', 'BR');
  const nameField = field('59', name.slice(0, 25));
  const cityField = field('60', city.slice(0, 15));
  const txid = field('05', '***');
  const additional = field('62', txid);

  const payload =
    field('00', '01') +
    merchantAccount +
    mcc +
    currency +
    amountField +
    country +
    nameField +
    cityField +
    additional +
    '6304';

  return payload + crc16(payload);
}

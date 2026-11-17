export function whatsAppUrl(message: string, rawPhone?: string) {
  const configured = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  let phone = (rawPhone || configured).replace(/\D/g, '');
  if (phone.length === 9) phone = `51${phone}`;
  if (!/^[1-9]\d{7,14}$/.test(phone)) phone = '';
  // With no business number, WhatsApp lets the user select a recipient. Never
  // invent a company phone number or claim delivery of the prepared message.
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

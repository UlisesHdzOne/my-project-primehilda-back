export function generateOrderNumber(lastOrderNumber?: string): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  let sequence = 1;

  if (lastOrderNumber) {
    const parts = lastOrderNumber.split('-');
    if (parts.length === 3 && parts[1] === dateStr) {
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }
  }

  const sequenceStr = String(sequence).padStart(3, '0');
  return `ORD-${dateStr}-${sequenceStr}`;
}

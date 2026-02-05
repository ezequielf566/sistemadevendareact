/**
 * Calculates the due date based on the transaction date using the specific business rules:
 * Cycle 1: Sales 06-19 -> Due 20th of current month.
 * Cycle 2: Sales 21-05 -> Due 5th (Next month if >=21, Current month if <=05).
 * Edge Case: 20th? Treated as start of Cycle 2 for safety, due 5th next month.
 */
export const calculateDueDate = (date: Date): Date => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Create a new date object to avoid mutating the original
  const dueDate = new Date(year, month, day);

  if (day >= 6 && day <= 19) {
    // Cycle 1: Due 20th of this month
    dueDate.setDate(20);
  } else {
    // Cycle 2: Due 5th
    dueDate.setDate(5);
    
    // If we are past the 5th (specifically >= 20th), it's due the 5th of NEXT month
    if (day >= 20) {
      dueDate.setMonth(month + 1);
    }
    // If day is 1-5, it's due the 5th of THIS month (which is today or upcoming days), 
    // effectively falling in the bucket of "pay by the 5th".
  }
  
  return dueDate;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getNextBillingWindowLabel = (): string => {
  const today = new Date();
  const day = today.getDate();
  
  if (day >= 6 && day <= 19) {
    return "Ciclo Vigente: 06 a 19 (Vence dia 20)";
  } else {
    return "Ciclo Vigente: 21 a 05 (Vence dia 05)";
  }
};
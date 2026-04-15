export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function calculateAge(value) {
  if (!value) {
    return "-";
  }

  const birthday = new Date(value);

  if (Number.isNaN(birthday.getTime())) {
    return "-";
  }

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDelta = today.getMonth() - birthday.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthday.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : "-";
}

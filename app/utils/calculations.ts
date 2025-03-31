export function calculateMonthlyPayment(principal: number, apr: number = 6.99, months: number = 60) {
  const monthlyRate = (apr / 100) / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(payment)
} 
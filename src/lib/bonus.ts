/** Текущий баланс = стартовые баллы профиля + сумма истории начислений. */
export function computeBalance(startingBonus: number, bonusHistory: { amount: number }[]): number {
  return startingBonus + bonusHistory.reduce((sum, entry) => sum + entry.amount, 0);
}

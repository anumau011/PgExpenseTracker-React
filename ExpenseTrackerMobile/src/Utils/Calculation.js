export const calculateBalances = (expenses, users) => {
  const balances = {};

  // Initialize the balance
  users.forEach(user => {
    balances[user.userId] = 0;
  });

  // Calculate the money spent by each
  // Add expenses for each user
  users.forEach(user => {
    (user.expenses || []).forEach(expense => {
      balances[user.userId] += expense.amount;
    });
  });

  console.log(balances);
  return Object.entries(balances).map(([userId, totalSpent]) => ({
    userId,
    totalSpent: Math.round(totalSpent * 100) / 100
  }));
};

// This will calculate the total expenses of the group
export const getTotalExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// For calculating the expense of the current user
const balance = () => {
  // Implementation here
};
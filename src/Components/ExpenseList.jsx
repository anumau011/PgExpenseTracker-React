//this is the list of the expenses
import { Receipt,Hash } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";


export const ExpenseList = ({ expenses }) => {
  const reversedExpenses = [...expenses].reverse(); // Newest first

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Receipt className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {reversedExpenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white/50 rounded-lg p-4 border border-white/20 hover:bg-white/70 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                  <p className="text-sm text-gray-600">Paid by {expense.paidBy}</p>
                  <p className="text-sm text-gray-500 mt-1">{expense.paymentDate}</p>
                  {expense.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {expense.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-black-700 font-semibold"
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">Rs. {expense.amount.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
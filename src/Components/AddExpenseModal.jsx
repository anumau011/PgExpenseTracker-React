import { useState, useEffect } from "react";
import axios from 'axios';
import { IndianRupee, X, Plus, Tag, Calendar, Hash } from "lucide-react";
import { useGroup } from "../Context/GroupContext";
import { getApiUrl } from "../Utils/api";

export const AddExpenseModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchGroup } = useGroup();

  const commonTags = [
    "grocery", "vegetables", "fruits", "bread", "paneer", "milk",
    "gas", "rice", "dal", "atta", "others"
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (amount && tags.length > 0 && selectedDate) {
      const expense = {
        amount: Math.round(parseFloat(amount) * 100) / 100,
        paymentDate: selectedDate,
        tags: tags.filter(tag => tag.trim() !== '')
      };

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          getApiUrl('/pg/addExpense'),
          expense,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201 || response.status === 200) {
          await fetchGroup();
          handleClose();
        }
      } catch (error) {
        console.error('Failed to add expense:', error);
        alert('Error adding expense ❌');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setAmount("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setTags([]);
    setNewTag("");
    onClose();
  };

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleNewTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const suggestedTags = [...new Set(commonTags)]
    .filter(tag => !tags.includes(tag) && tag.includes(newTag.toLowerCase()))
    .slice(0, 8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IndianRupee className="h-4 w-4 inline mr-1" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="0.00"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              Tags
            </label>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    <strong>{tag}</strong>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleNewTagKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (e.g., grocery, milk)"
              />
              {newTag && (
                <button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {suggestedTags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || tags.length === 0 || isLoading}
              className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
            >
              {isLoading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

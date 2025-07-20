import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from "../Utils/api";

export default function CreateGroupForm({onClose}){
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        getApiUrl('/pg/create-group'),
        { groupName: groupName.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const createdGroup = response.data;
      setGroupCode(createdGroup.groupCode); // ✅ Show code after creation
      setGroupName('');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(error.response.data); // Show "User is already in a group"
      }
    }finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center">
        {!groupCode ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-300"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Group Created!</h2>
            <p className="text-gray-700 mb-2">Here is your group code:</p>
            <div className="bg-gray-100 px-4 py-2 rounded text-lg font-mono mb-4">{groupCode}</div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                {copySuccess ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};



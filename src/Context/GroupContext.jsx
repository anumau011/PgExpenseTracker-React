import { createContext, useContext, useState, useEffect } from "react";
import { calculateBalances, getTotalExpenses } from "../Utils/Calculation";
import axios from "axios";
import { useUser } from "./CurrentUserIdContext";
import { getApiUrl } from "../Utils/api";

const GroupContext = createContext();
export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balances, setBalances] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);

  const { currentUserId } = useUser(); // ✅ keep here, but read it in useEffect
   

  // Fetch group from backend
  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        getApiUrl('/pg/my-group'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const group = response.data;
      setCurrentGroup(group);
    } catch (error) {
      console.error("Error fetching group:", error);
    }
  };

  // Recalculate balances when group or user changes
  useEffect(() => {
    if (currentGroup && currentUserId) {
      const users = currentGroup.users || [];
      const expenses = currentGroup.expenses || [];

      const computedBalances = calculateBalances(expenses, users);
      const total = getTotalExpenses(expenses);
      const currentUserBalance = computedBalances.find(
        (b) => b.userId.toString() === currentUserId.toString()
      );

      console.log("currentUserId:", currentUserId);
      console.log("computedBalances:", computedBalances);
      console.log("currentUserBalance:", currentUserBalance);

      setBalances(computedBalances);
      setTotalExpenses(total);
      setCurrentBalance(currentUserBalance?.totalSpent || 0);

    }
  }, [currentGroup, currentUserId]);

  return (
    <GroupContext.Provider
      value={{
        currentGroup,
        setCurrentGroup,
        balances,
        totalExpenses,
        currentBalance,
        fetchGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

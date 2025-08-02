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
   

  // Fetch current group data from backend (refreshes the current selected group)
  const fetchGroup = async () => {
    if (!currentGroup?.groupCode && !currentGroup?.code && !currentGroup?.id) {
      console.warn("No current group selected to fetch");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Fetch all groups and find the current one
      const response = await axios.get(
        getApiUrl('/pg/my-groups'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const groups = Array.isArray(response.data) ? response.data : [response.data];
      const groupIdentifier = currentGroup.groupCode || currentGroup.code || currentGroup.id;
      
      // Find the current group in the list
      const updatedGroup = groups.find(g => 
        g.groupCode === groupIdentifier || g.code === groupIdentifier || g.id === groupIdentifier
      );
      
      if (updatedGroup) {
        setCurrentGroup(updatedGroup);
      } else {
        console.warn("Current group not found in user's groups");
      }
    } catch (error) {
      console.error("Error fetching current group:", error);
    }
  };

  // Fetch and set initial group (for page refresh or first load)
  const fetchInitialGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch all groups that the user belongs to
      const response = await axios.get(
        getApiUrl('/pg/my-groups'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const groups = Array.isArray(response.data) ? response.data : [response.data];
      
      if (groups.length > 0) {
        // Check if there's a stored group preference
        const storedGroupCode = localStorage.getItem('currentGroupCode');
        
        if (storedGroupCode) {
          // Try to find the stored group
          const storedGroup = groups.find(g => 
            g.groupCode === storedGroupCode || g.code === storedGroupCode || g.id === storedGroupCode
          );
          
          if (storedGroup) {
            setCurrentGroup(storedGroup);
            return;
          }
        }
        
        // If no stored group or stored group not found, use the first group
        setCurrentGroupWithStorage(groups[0]);
      } else {
        console.warn("User is not part of any groups");
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error("Error fetching initial group:", error);
      setCurrentGroup(null);
    }
  };

  // Custom setCurrentGroup that also stores in localStorage
  const setCurrentGroupWithStorage = (group) => {
    setCurrentGroup(group);
    if (group) {
      const groupCode = group.groupCode || group.code || group.id;
      localStorage.setItem('currentGroupCode', groupCode);
    } else {
      localStorage.removeItem('currentGroupCode');
    }
  };

  // Fetch all groups that the user belongs to
  const fetchAllGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        getApiUrl('/pg/my-groups'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error("Error fetching all groups:", error);
      return [];
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
        setCurrentGroup: setCurrentGroupWithStorage,
        balances,
        totalExpenses,
        currentBalance,
        fetchGroup,
        fetchAllGroups,
        fetchInitialGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import { useDebounce } from "../hooks/use-debounce";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";

// Use the User interface to handle the object data correctly
interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface Props {
  ticketId: number;
  currentAssigned?: string;
  onAssignmentSuccess?: () => void; // Callback for parent component
}

export default function AssignUser({ ticketId, currentAssigned, onAssignmentSuccess }: Props) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearchText, setUserSearchText] = useState(currentAssigned || "");
  const debouncedUserSearch = useDebounce(userSearchText, 300);

  const selectedUserName = useMemo(() => {
    return users.find(u => u.id.toString() === selectedUserId)?.name || "";
  }, [users, selectedUserId]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get<User[]>(`/users?search=${encodeURIComponent(debouncedUserSearch)}`);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    }
    fetchUsers();
  }, [debouncedUserSearch]);

  // Set initial state from props
  useEffect(() => { setUserSearchText(currentAssigned || ""); }, [currentAssigned]);

  // When the user list or search text changes, re-evaluate the selected user ID.
  useEffect(() => {
    const selected = users.find(u => u.name === userSearchText);
    setSelectedUserId(selected ? selected.id.toString() : "");
  }, [users, userSearchText]);

  async function handleAssign() {
    if (!selectedUserId) {
      alert("Please select a user.");
      return;
    }

    try {
      // Use the generic update route '/tickets/:id'
      await api.put(`/tickets/${ticketId}`, {
        assignedTo: parseInt(selectedUserId), 
      });

      toast({
        title: "Success!",
        description: "Ticket has been assigned.",
      });

      // Notify parent component to refetch data
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (error) {
      console.error("Failed to assign ticket", error);
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: "Could not assign ticket. Check console for details.",
      });
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-grow">
        <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-1">
          Assigned To:
        </label>
        <input
          id="user-search"
          list="user-list"
          value={userSearchText}
          onChange={(e) => setUserSearchText(e.target.value)}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearchText(e.target.value)}
          placeholder="Search for a user..."
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
        <datalist id="user-list">
          {users.map((u) => <option key={u.id} value={u.name} />)}
        </datalist>
      </div>
      <Button onClick={handleAssign} disabled={!selectedUserId || selectedUserName === currentAssigned}>
        Assign
      </Button>
    </div>
  );
}
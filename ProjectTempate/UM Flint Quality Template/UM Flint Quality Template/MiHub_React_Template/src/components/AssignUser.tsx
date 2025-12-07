import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import { useDebounce } from "../hooks/use-debounce";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext"; // Import useAuth

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
  // Get current user ID and Role for assignment logic
  const { userId, userRole } = useAuth(); 
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearchText, setUserSearchText] = useState(currentAssigned || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const debouncedUserSearch = useDebounce(userSearchText, 300);

  const selectedUserName = useMemo(() => {
    return users.find(u => u.id.toString() === selectedUserId)?.name || "";
  }, [users, selectedUserId]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        // NOTE: Assumes the backend '/users' endpoint is protected by auth.middleware 
        // and handles the necessary token injection via an axios interceptor (or similar).
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
      toast({
        variant: "destructive",
        title: "No User Selected",
        description: "Please choose a user before assigning.",
      });
      return;
    }
    
    // Explicit Role Check: Viewers cannot assign
    if (userRole === 'viewer') {
        return toast({
            variant: "destructive",
            title: "Authorization Failed",
            description: "Viewers are not allowed to assign tickets.",
        });
    }

    setShowConfirm(true);
  }

  async function executeAssign() {
    if (!selectedUserId) return;

    const selectedId = parseInt(selectedUserId, 10);
    const isAssigningSelf = selectedId === userId;
    let endpoint = '';
    
    // Editors can assign themselves, Admins can assign anyone
    if (isAssigningSelf) {
        // Use the dedicated self-assign endpoint
        endpoint = `/tickets/${ticketId}/assign/self`;
    } else {
        // Use the dedicated admin-assign endpoint
        // The backend authorize middleware will ensure only Admins can hit this.
        endpoint = `/tickets/${ticketId}/assign/${selectedUserId}`;
    }

    try {
      // Use the new PATCH call
      await api.patch(endpoint); 

      toast({
        title: "Success!",
        description: `Ticket has been assigned to ${selectedUserName}.`,
      });

      // Notify parent component to refetch data
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (error: any) {
      console.error("Failed to assign ticket", error);
      const errorMessage = error.response?.data?.message || "Could not assign ticket. Check console for details.";
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: errorMessage,
      });
    }
  }

  const isAssignButtonDisabled = !selectedUserId || selectedUserName === currentAssigned || userRole === 'viewer';

  return (
    <>
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
        <Button 
          onClick={handleAssign} 
          disabled={isAssignButtonDisabled}
        >
          Assign
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]" onClick={() => setShowConfirm(false)}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Confirm Assignment</h3>
            <p className="text-sm text-gray-700 mb-4">Assign this ticket to {selectedUserName || "the selected user"}?</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={async () => { await executeAssign(); setShowConfirm(false); }}>Yes, Assign</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
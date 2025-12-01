import { useEffect, useState } from "react";
import { api } from "../api";

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
}

export default function AssignUser({ ticketId, currentAssigned }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  // Store the selected ID as a string (from the select input), or empty if none
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await api.get<User[]>("/users");
        setUsers(data);

        // If we have a currentAssigned name, try to find the matching ID to set the default
        if (currentAssigned) {
          const found = data.find((u) => u.name === currentAssigned);
          if (found) setSelectedUserId(found.id.toString());
        }
      } catch (err) {
        console.error("Failed to load users", err);
      }
    }
    fetchUsers();
  }, [currentAssigned]);

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

      alert("Ticket assigned successfully!");
    } catch (error) {
      console.error("Failed to assign ticket", error);
      alert("Failed to assign ticket. Check console for details.");
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Assign Ticket</h3>

      <select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        className="border rounded p-1"
      >
        <option value="">Select user...</option>
        {users.map((u) => (
          // Use ID as the value for reliability
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <button style={{ marginLeft: "10px" }} onClick={handleAssign}>
        Assign
      </button>
    </div>
  );
}
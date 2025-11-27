import { useEffect, useState } from "react";
import { apiPut, apiGet } from "../lib/api";

interface Props {
  ticketId: number;
  currentAssigned?: string; // fixed spelling
}

export default function AssignUser({ ticketId, currentAssigned }: Props) {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(currentAssigned || "");

  useEffect(() => {
    async function fetchUsers() {
      const data = await apiGet<string[]>("/users");
      setUsers(data);
    }
    fetchUsers();
  }, []);

  async function handleAssign() {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    await apiPut(`/tickets/${ticketId}/assign`, {
      assignedTo: selectedUser,
    });

    alert("Ticket assigned successfully!");
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Assign Ticket</h3>

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Select user...</option>
        {users.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <button style={{ marginLeft: "10px" }} onClick={handleAssign}>
        Assign
      </button>
    </div>
  );
}

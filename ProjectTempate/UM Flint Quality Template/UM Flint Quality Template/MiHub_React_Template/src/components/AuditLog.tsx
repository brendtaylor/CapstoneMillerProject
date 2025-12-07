import React, { useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { api } from "../api"; // [FIX] Import the axios instance

interface AuditLogEntry {
  logId: number;
  userId: number | null;
  userRole: number | null;
  ticketId: number | null;
  woId: number | null;
  action: string;
  timestamp: string;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-Focus Search Bar Cursor on Refresh
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounce Search
  useEffect(() => {
    const timerId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // [FIX] Updated mapping to match Database/Backend (1=Viewer, 2=Editor, 3=Admin)
  function getRoleName(role: number | null): string {
    switch (role) {
      case 1:
        return "Viewer";
      case 2:
        return "Editor";
      case 3:
        return "Admin";
      default:
        return "—"; 
    }
  }

  function formatTicketId(ticketId: number): string {
    // Make it Positive
    const positiveValue = Math.abs(999-ticketId);
    // Pad to 3 digits
    return positiveValue.toString().padStart(3, "0");
  }

  const handleSearch = async (term: string) => {
    setLoading(true);
    setError(false);
    setIsSearching(true);

    try {
      // [FIX] Use 'api.get' instead of fetch. 
      // This automatically handles the Base URL and Authorization Header.
      const endpoint = term
        ? `/audit?search=${encodeURIComponent(term.toLowerCase())}`
        : `/audit`;

      const response = await api.get<any[]>(endpoint);

      const mapped: AuditLogEntry[] = response.data.map((row: any) => ({
        logId: row.logId,
        userId: row.userId ?? null,
        userRole: row.userRole ?? null,
        ticketId: row.ticketId ?? null,
        woId: row.woId ?? null,
        action: row.action,
        timestamp: row.timestamp
      }));

      setLogs(mapped);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(true);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="p-4">
      {/* --- SEARCH BAR --- */}
      <div className="flex items-center gap-4 mb-6">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by Action or Work Order..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-96 border border-gray-300 rounded-md p-2"
        />
        {isSearching && <ScaleLoader color="#3b82f6" height={20} />}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <ScaleLoader color="#3b82f6" />
          <span className="ml-2">Loading audit logs...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">Could not Fetch Audit Logs</div>
      ) : logs.length === 0 ? (
        searchTerm ? (
          <div className="text-gray-500 text-center p-4">
            No audit logs found matching your search.
          </div>
        ) : (
          <div className="text-gray-500 text-center p-4">
            No audit logs available.
          </div>
        )
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Log ID</th>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">User Role</th>
              <th className="border px-4 py-2">Work Order ID</th>
              <th className="border px-4 py-2">Ticket ID</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.logId}>
                <td className="border px-4 py-2">{log.logId}</td>
                <td className="border px-4 py-2">{log.userId ?? "—"}</td>
                <td className="border px-4 py-2">{getRoleName(log.userRole)}</td>
                <td className="border px-4 py-2">{log.woId ?? "—"}</td>
                <td className="border px-4 py-2">{log.ticketId != null ? formatTicketId(log.ticketId) : "—"}</td>
                <td className="border px-4 py-2">{log.action || "—"}</td>
                <td className="border px-4 py-2">
                  {log.timestamp && !isNaN(Date.parse(log.timestamp))
                    ? new Date(log.timestamp).toLocaleString()
                    : "Invalid Date"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLog;
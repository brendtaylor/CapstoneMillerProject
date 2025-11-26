import React, { useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

// Define the shape of your audit log entry
interface Ticket {
  ticketId: number;
  qualityTicketId: string;
  openDate: string;
  closeDate: string | null;
  description: string;
  drawingNum: string;
  estimatedLaborHours: number | null;
  correctiveAction: string | null;
  materialsUsed: string | null;
}

interface AuditLogEntry {
  logId: number;
  userId: number;
  ticketId: number;
  action: string;
  timestamp: string;
  woId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  ticket: Ticket;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("http://localhost:3000/api/audit", {
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Could not Fetch Audit Logs");
        }

        const data = await response.json();

        // Map into AuditLogEntry shape
        const mapped: AuditLogEntry[] = data.map((row: any) => ({
          logId: row.logId,
          userId: row.userId,
          ticketId: row.ticketId,
          action: row.action,
          timestamp: row.timestamp,
          woId: row.woId,
          user: {
            id: row.userId,
            name: `User #${row.userId}`,
            email: ""
          },
          ticket: row.ticket
        }));

        setLogs(mapped);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Poll Every 5 Seconds (For Refresh)
    //const interval = setInterval(fetchLogs, 5000);

    // Cleanup when Component Unmounts
    //return () => clearInterval(interval);
  }, []);

  // Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <ScaleLoader color="#3b82f6" />
        <span className="ml-2">Loading audit logs...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Could not Fetch Audit Logs
      </div>
    );
  }

  // No logs
  if (logs.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No audit logs found.
      </div>
    );
  }

  // Table render
  return (
    <div className="p-4">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Log ID</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Ticket</th>
            <th className="border px-4 py-2">Action</th>
            <th className="border px-4 py-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.logId}>
              <td className="border px-4 py-2">{log.logId}</td>
              <td className="border px-4 py-2">{log.user.name}</td>
              <td className="border px-4 py-2">
                {log.ticket?.qualityTicketId ??
                  `${log.woId}-${String(log.ticketId).padStart(3, "0")}`}
              </td>
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
    </div>
  );
};

export default AuditLog;

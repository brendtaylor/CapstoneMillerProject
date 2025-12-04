import React, {useEffect, useState} from "react";
import { ClipboardList } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useAuth } from "../../components/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import FileForm from "../../components/FileForm";
import TicketList from "../../components/TicketList";
import AuditLog from "../../components/AuditLog";
import ArchiveList from "./ArchiveList"; 
import { useLocation } from "react-router-dom"; 

const Quality: React.FC = () => {
    const isMobile = useIsMobile();
    const location = useLocation(); 
    const { userRole } = useAuth();
    
    // --- TABS CONTROL ---
    // Default to 'tickets', but check location.state for overrides (e.g. from Back button)
    const [activeTab, setActiveTab] = useState("tickets");

    useEffect(() => {
      if (location.state && location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }, [location]);

    const [showForm, setShowForm] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Prevent background scrolling when the create ticket overlay is open
    useEffect(() => {
      document.body.style.overflow = showForm ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }, [showForm]);

    // Sidebar Logic
    let sidebar;
    if (isMobile) {
      sidebar = (
        <>
          <div className="xl:hidden w-full bg-muted/50 border-b-2 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Quality</h2>
            </div>
            <button onClick={() => setDropdownOpen(true)} className="text-sm text-white flex items-center gap-1 border border-black rounded-md px-3 py-1 bg-blue-500 hover:bg-blue-600 transition">Menu <span className="text-lg">▾</span></button>
          </div>
          {dropdownOpen && (
            <div className="fixed inset-0 z-50 bg-gray-800 flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center"><ClipboardList className="w-6 h-6 text-white" /></div>
                  <h2 className="text-lg text-white font-semibold">Quality</h2>
                </div>
                <button onClick={() => setDropdownOpen(false)} className="text-sm text-white flex items-center gap-1 border border-black rounded-md px-3 py-1 bg-red-500 hover:bg-red-600 transition">Close <span className="text-lg">▴</span></button>
              </div>
              <div className="border-b border-gray-300 mb-6"></div>
              <TabsList className="flex flex-col gap-4 mt-16 bg-gray-800">
                <TabsTrigger value="tickets" className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2 hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform data-[state=inactive]:bg-white data-[state=active]:bg-gray-500" onClick={() => { setActiveTab("tickets"); setDropdownOpen(false); }}>Tickets</TabsTrigger>
                <TabsTrigger value="checklist" className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2 hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform data-[state=inactive]:bg-white data-[state=active]:bg-gray-500" onClick={() => { setActiveTab("checklist"); setDropdownOpen(false); }}>Checklist</TabsTrigger>
                <TabsTrigger value="auditlog" className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2 hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform data-[state=inactive]:bg-white data-[state=active]:bg-gray-500" onClick={() => { setActiveTab("auditlog"); setDropdownOpen(false); }}>Audit Log</TabsTrigger>
                <TabsTrigger value="archivedTickets" className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2 hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform data-[state=inactive]:bg-white data-[state=active]:bg-gray-500" onClick={() => { setActiveTab("archivedTickets"); setDropdownOpen(false); }}>Archived Tickets</TabsTrigger>
              </TabsList>
            </div>
          )}
        </>
      );
    } else {
      sidebar = (
        <div className="xl:w-64 w-full xl:flex-shrink-0 bg-muted/50 border-r-2 p-4 hidden xl:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center"><ClipboardList className="w-6 h-6 text-white" /></div>
            <h2 className="text-lg font-semibold">Quality</h2>
          </div>
          <div className="border w-full mb-4"></div>
          <TabsList className="flex flex-col gap-2 bg-transparent">
            <TabsTrigger value="tickets" className="w-full justify-start data-[state=active]:bg-background mt-14">Tickets</TabsTrigger>
            <TabsTrigger value="checklist" className="w-full justify-start data-[state=active]:bg-background">Checklist</TabsTrigger>
            <TabsTrigger value="auditlog" className="w-full justify-start data-[state=active]:bg-background">Audit Log</TabsTrigger>
            <TabsTrigger value="archivedTickets" className="w-full justify-start data-[state=active]:bg-background">Archived Tickets</TabsTrigger>
          </TabsList>
        </div>
      );
    }

  return (
    // Updated to use Controlled Component props: value & onValueChange
    <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen bg-gray-100">
      <div className="flex flex-col xl:flex-row w-full max-w-[1300px] mx-auto min-h-screen">
        {sidebar}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          
          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="my-2">
            <Card>
                <CardHeader className="flex flex-row justify-between item-center w-full">
                    <CardTitle>Tickets<p className="text-sm font-normal mt-1">List of Tickets</p></CardTitle>
                    <div className="flex-shrink-0">
                      <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Ticket</button>
                    </div>
                </CardHeader>
                <CardContent>
                    <TicketList />
                </CardContent>
            </Card>
          </TabsContent>
          
          {/* Create Form Overlay */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-0" onClick={() => setShowForm(false)}>
              <div className="bg-white p-4 sm:p-6 rounded shadow-lg w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700">✕</button>
                <CardTitle>File Form</CardTitle>
                <p className="text-sm font-normal mt-1">Create a Ticket</p>
                <div className="h-4" />
                <FileForm onClose={() => setShowForm(false)} />
              </div>
            </div>
          )}

          {/* CHECKLIST TAB */}
          <TabsContent value="checklist" className="my-2">
            <Card>
              <CardHeader className="flex flex-row"><CardTitle>Checklist<p className="text-sm font-normal mt-1">Quality Digital Checklist - Alpha.</p></CardTitle></CardHeader>
              <CardContent><div>Placeholder.</div></CardContent>
            </Card>
          </TabsContent>

          {/* AUDIT LOG TAB */}
          <TabsContent value="auditlog" className="my-2">
            <Card>
              <CardHeader className="flex flex-row"><CardTitle>Audit Log<p className="text-sm font-normal mt-1">Edited Tickets</p></CardTitle></CardHeader>
              <AuditLog />
            </Card>
          </TabsContent>

          {/* ARCHIVES TAB */}
          <TabsContent value="archivedTickets" className="my-2">
            <Card>
              <CardContent>
                <ArchiveList />
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </div>
    </Tabs>
  );
}

export default Quality;
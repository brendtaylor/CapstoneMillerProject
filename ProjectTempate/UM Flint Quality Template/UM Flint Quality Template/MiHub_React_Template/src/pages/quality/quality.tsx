import React, {useEffect, useState} from "react";
import { ClipboardList } from "lucide-react";
import ScaleLoader from "react-spinners/ScaleLoader"
import { useIsMobile } from "../../hooks/use-mobile";
import { useAuth } from "../../components/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "../../components/ui/dialog"
// import ChecklistComponent from "./checklist";
import { Button } from "../../components/ui/button";
import FileForm from "../../components/FileForm";


//Quality top view ticket progress and ticket creation to make them easily

const Quality: React.FC = () => {
    //temp values
    const isMobile = useIsMobile();
    const construction = false;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); 
    const { userRole } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    //Set sidebar/drop down for mobile and desktop
    let sidebar;
    if (isMobile) {
        sidebar = (
          <>
        <button
          className="flex items-center justify-between p-4 bg-muted border-b"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold">Quality</h2>
        </div>

        {/* Mobile Drop Down Arrow */}
        <svg
          className={`w-5 h-5 transform transition-transform ${isSidebarOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 flex justify-center items-start pt-32 px-4"
          onClick={() => setIsSidebarOpen(false)}
        >
        <div
          className="bg-white rounded-md shadow-lg border border-gray-300 w-full max-w-sm flex flex-col items-start p-6 mt-6 pb-20"
          onClick={(e) => e.stopPropagation()}
        >

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 z-10">
          <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold">Quality</h2>
        </div>

        {/* Tabs */}
        <TabsList className="flex flex-col gap-2 bg-white p-2 rounded-md shadow-sm">
            <TabsTrigger value="tickets" 
              className="
                w-full text-left px-4 py-2 rounded-md border border-gray-300
                bg-white text-gray-600
                hover:bg-gray-100 hover:text-gray-800
                data-[state=active]:bg-gray-200
                data-[state=active]:border-gray-400
                data-[state=active]:text-gray-700
                transition-all
                mt-12
              "
              onClick={() => setIsSidebarOpen(false)}
              >
                Tickets
            </TabsTrigger>
            <TabsTrigger value="checklist" 
              className="
                w-full text-left px-4 py-2 rounded-md border border-gray-300
                bg-white text-gray-600
                hover:bg-gray-100 hover:text-gray-800
                data-[state=active]:bg-gray-200
                data-[state=active]:border-gray-400
                data-[state=active]:text-gray-700
                transition-all
              "
              onClick={() => setIsSidebarOpen(false)}
              >
                Checklist
            </TabsTrigger>
            <TabsTrigger value="ticketForm" 
              className="
                w-full text-left px-4 py-2 rounded-md border border-gray-300
                bg-white text-gray-600
                hover:bg-gray-100 hover:text-gray-800
                data-[state=active]:bg-gray-200
                data-[state=active]:border-gray-400
                data-[state=active]:text-gray-700
                transition-all
              "
              onClick={() => setIsSidebarOpen(false)}
              >
                File Form
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      )}
    </>
    )
    } 
    else {
      {/* Website Sidebar */}
      sidebar = (
        <div className="md:w-64 w-full md:flex-shrink-0 bg-muted/50 border-r-2 p-4">
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Quality</h2>
          </div>

          <div className="border w-full mb-4"></div>

          <TabsList className="flex flex-col gap-2">
            <TabsTrigger value="tickets" className="w-full justify-start data-[state=active]:bg-background mt-14">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="checklist" className="w-full justify-start data-[state=active]:bg-background">
              Checklist
            </TabsTrigger>
            <TabsTrigger value="ticketForm" className="w-full justify-start data-[state=active]:bg-background">
              File Form
            </TabsTrigger>
          </TabsList>
        </div>
      );
    }


  return (
    <Tabs defaultValue="tickets" className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-[1300px] mx-auto min-h-screen">
        
        {sidebar}

        {/* Main */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Tickets Page */}
          <TabsContent value="tickets" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle> 
                  Tickets
                  <p className="text-sm font-normal mt-1">List of Tickets</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div>You can ignore this but using as placeholder.</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist Page */}
          <TabsContent value="checklist" className="my-2">
            <Card>
              <CardHeader className="flex flex-row">
                <CardTitle>
                  Checklist
                  <p className="text-sm font-normal mt-1">Quality Digital Checklist - Alpha.</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div>You can ignore this but using as placeholder.</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Form Page */}
          <TabsContent value="ticketForm" className="my-2">
            <Card>
              <CardHeader className="flex flex-row">
                <CardTitle>
                  File Form
                  <p className="text-sm font-normal mt-1">Create A Ticket</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileForm/>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );

}

export default Quality;
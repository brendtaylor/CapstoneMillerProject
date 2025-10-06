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
    const [dropdownOpen, setDropdownOpen] = useState(false);

    //Set sidebar/drop down for mobile and desktop
    let sidebar;
    if (isMobile) {
      sidebar = (
        <>
          <div className="md:hidden w-full bg-muted/50 border-b-2 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Quality</h2>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setDropdownOpen(true)}
              className="text-sm text-white flex items-center gap-1 border border-black rounded-md px-3 py-1 bg-blue-500 hover:bg-blue-600 transition"
            >
              Menu <span className="text-lg">▾</span>
            </button>
          </div>

          {/* Tabs Overlay */}
          {dropdownOpen && (
            
            <div className="fixed inset-0 z-50 bg-gray-800 flex flex-col p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg text-white font-semibold">Quality</h2>
                </div>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-sm text-white flex items-center gap-1 border border-black rounded-md px-3 py-1 bg-red-500 hover:bg-red-600 transition"
                >
                  Close <span className="text-lg">▴</span>
                </button>
              </div>

              {/* Formating Bar */}
              <div className="border-b border-gray-300 mb-6"></div>

              {/* Tabs List */}
              
              <TabsList className="flex flex-col gap-4 mt-16 bg-gray-800">
                <TabsTrigger
                  value="tickets"
                  className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2
                            hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform
                            data-[state=inactive]:bg-white data-[state=active]:bg-gray-500"
                  onClick={() => setDropdownOpen(false)}
                >
                  Tickets
                </TabsTrigger>
                <TabsTrigger
                  value="checklist"
                  className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2
                            hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform
                            data-[state=inactive]:bg-white data-[state=active]:bg-gray-500"
                  onClick={() => setDropdownOpen(false)}
                >
                  Checklist
                </TabsTrigger>
                <TabsTrigger
                  value="ticketForm"
                  className="w-full justify-start text-lg text-black border border-black rounded-md px-4 py-2
                            hover:brightness-105 hover:shadow-md hover:scale-[1.02] transition-transform
                            data-[state=inactive]:bg-white data-[state=active]:bg-gray-500"
                  onClick={() => setDropdownOpen(false)}
                >
                  File Form
                </TabsTrigger>
              </TabsList>
            </div>
          )}
        </>
      );
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

          <TabsList className="flex flex-col gap-2 bg-transparent">
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
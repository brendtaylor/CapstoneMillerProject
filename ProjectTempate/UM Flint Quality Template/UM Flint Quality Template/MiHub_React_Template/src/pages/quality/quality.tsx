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

    //if (construction) {
    //  return <div className="text-center text-lg font-bold p-4">Quality Under Development!</div>;
    //}
    //else if (isMobile) {
    //  return <div className="text-center text-lg font-bold p-4">📵 Quality on Mobile!</div>;
    //}
    
  return (
    <Tabs defaultValue="tickets" className="min-h-screen bg-gray-100">
      <div className="max-w-[1300px] mx-auto bg-gray-100 shadow-md rounded-sm min-h-screen flex flex-col md:flex-row">

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-muted/50 border-r-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Quality</h2>
          </div>

          <div className="border w-full mb-4"></div>

          <TabsList className="fflex flex-col gap-2">
            <TabsTrigger value="tickets" className="w-full justify-start data-[state=active]:bg-background">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="checklist" className="w-full justify-start data-[state=active]:bg-background">
              Checklist
            </TabsTrigger>
            <TabsTrigger value="ticketForm" className="w-full justify-start data-[state=active]:bg-background">
              Ticket Form
            </TabsTrigger>
          </TabsList>
        </div>

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
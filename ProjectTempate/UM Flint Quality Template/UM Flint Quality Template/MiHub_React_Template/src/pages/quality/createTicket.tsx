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

import FileForm from '../../components/FileForm';


//Mught add to quality

const CreateTicket: React.FC = () => {
    //temp values
    const isMobile = useIsMobile();
    const construction = false;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); 
    const { userRole } = useAuth();

    if (construction) {
      return <div className="text-center text-lg font-bold p-4">CreateTicket Under Development!</div>;
    }
    else if (isMobile) {
      return <div className="text-center text-lg font-bold p-4">📵 CreateTicket on Mobile!</div>;
    }
    
  return (
    <Tabs defaultValue="tickets" className="min-h-screen bg-gray-100">
      <div className="max-w-[1300px] mx-auto bg-gray-100 shadow-md rounded-sm min-h-screen flex">
        
        {/* Sidebar */}
        <div className="w-64 bg-muted/50 border-r-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Ticket Options</h2>
          </div>

          <div className="border w-full mb-4"></div>

          {/* Sidebar Tabs */}
          <TabsList className="flex flex-col gap-2">
            <TabsTrigger value="tickets" className="w-full justify-start data-[state=active]:bg-background">
              Tickets
            </TabsTrigger>
            
          </TabsList>
        </div>

        {/* Main */}
        <div className="flex-1 p-6 overflow-y-auto">
          <TabsContent value="tickets" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Ticket Form
                  {/* If you want a subheader "<p className="text-sm font-normal mt-1">Ticket Options</p>"*/}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white shadow-md rounded-md">
                  <FileForm />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </Tabs>


  );

}

export default CreateTicket;
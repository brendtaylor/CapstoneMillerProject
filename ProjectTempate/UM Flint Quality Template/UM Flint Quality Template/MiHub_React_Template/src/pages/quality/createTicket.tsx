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


//Might add to quality

const CreateTicket: React.FC = () => {
    //temp values
    const isMobile = useIsMobile();
    const construction = false;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); 
    const { userRole } = useAuth();

    //if (construction) {
    //  return <div className="text-center text-lg font-bold p-4">CreateTicket Under Development!</div>;
    //}
    //else if (isMobile) {
    //  return <div className="text-center text-lg font-bold p-4">📵 CreateTicket on Mobile!</div>;
    //}
    
    return (
      <Tabs defaultValue="tickets" className="min-h-screen bg-gray-100">
        <div className="max-w-[1300px] mx-auto bg-gray-100 shadow-md rounded-sm min-h-screen flex flex-col md:flex-row">

        {/* Main */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <TabsContent value="tickets" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Form</CardTitle>
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
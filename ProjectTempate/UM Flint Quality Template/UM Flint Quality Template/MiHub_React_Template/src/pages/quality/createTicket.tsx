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
    <Tabs
  defaultValue="tickets"
  className="flex flex-col lg:flex-row flex-1 min-h-full min-w-full gap-6 max-w-3xl pr-5"
>
  <TabsList className="flex flex-row lg:flex-col min-h-auto lg:min-h-[1000px] w-full lg:max-w-64 bg-muted/50 border-r-0 lg:border-r-2 rounded-none">
    <div className="flex flex-row w-full items-center gap-2 text-black p-4">
      <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
        <ClipboardList className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-lg font-semibold hidden sm:block">
        Create Ticket
      </h2>
    </div>
    <div className="border w-full lg:w-56 mb-5"></div>
    <TabsTrigger
      value="tickets"
      className="w-full justify-start data-[state=active]:bg-background"
    >
      Tickets
    </TabsTrigger>
  </TabsList>

  <div className="flex-1">
    <TabsContent value="tickets" className="my-2">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>
            Create a Ticket
            <p className="text-sm font-normal mt-1">Ticket Options</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] md:h-[600px] overflow-y-auto p-4 bg-white shadow-md rounded-md">
            <FileForm />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </div>
</Tabs>

  );

}

export default CreateTicket;
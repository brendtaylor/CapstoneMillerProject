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

//Ignore

const Purchasing: React.FC = () => {
    //temp values
    const isMobile = useIsMobile();
    const construction = false;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); 
    const { userRole } = useAuth();

    if (construction) {
      return <div className="text-center text-lg font-bold p-4">Purchasing Under Development!</div>;
    }
    else if (isMobile) {
      return <div className="text-center text-lg font-bold p-4">📵 Purchasing on Mobile!</div>;
    }
    
  return (
      <Tabs defaultValue="bought" className="min-h-screen bg-gray-100">
        <div className="max-w-[1300px] mx-auto bg-gray-100 shadow-md rounded-sm min-h-screen flex flex-col md:flex-row">
      
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-muted/50 border-r-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Purchasing</h2>
          </div>

          <div className="border w-full mb-4"></div>

          <TabsList className="fflex flex-col gap-2">
            <TabsTrigger value="bought" className="w-full justify-start data-[state=active]:bg-background">
              Bought
            </TabsTrigger>
            <TabsTrigger value="toBuy" className="w-full justify-start data-[state=active]:bg-background">
              To Buy
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Location 1 */}
          <TabsContent value="bought" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>Bought</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white shadow-md rounded-md">
                  <div>Temp Placeholder</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location 2 */}
          <TabsContent value="toBuy" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>To Buy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white shadow-md rounded-md">
                  <div>Temp Placeholder</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}

export default Purchasing;
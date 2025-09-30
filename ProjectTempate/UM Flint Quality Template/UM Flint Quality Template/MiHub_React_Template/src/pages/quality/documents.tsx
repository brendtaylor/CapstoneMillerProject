import React, { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useIsMobile } from "../../hooks/use-mobile";
import { useAuth } from "../../components/AuthContext";





const Documents: React.FC = () => {
  const isMobile = useIsMobile();
  const construction = false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useAuth();

  if (construction) return <div className="text-center p-4 font-bold">Documents Under Development!</div>;
  if (isMobile) return <div className="text-center p-4 font-bold">📵 Documents on Mobile!</div>;

  return (
    <Tabs defaultValue="location1" className="min-h-screen bg-gray-100">
        <div className="max-w-[1300px] mx-auto bg-gray-100 shadow-md rounded-sm min-h-screen flex flex-col md:flex-row">
      
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-muted/50 border-r-2 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Documents</h2>
          </div>

          <div className="border w-full mb-4"></div>

          <TabsList className="fflex flex-col gap-2">
            <TabsTrigger value="location1" className="w-full justify-start data-[state=active]:bg-background">
              Location 1
            </TabsTrigger>
            <TabsTrigger value="location2" className="w-full justify-start data-[state=active]:bg-background">
              Location 2
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Location 1 */}
          <TabsContent value="location1" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>Location 1</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white shadow-md rounded-md">
                  <div>Temp Placeholder</div>
                  
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location 2 */}
          <TabsContent value="location2" className="my-2">
            <Card>
              <CardHeader>
                <CardTitle>Location 2</CardTitle>
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

export default Documents;

import React, {useEffect, useState} from "react";
import { ClipboardList, Divide } from "lucide-react";
import ScaleLoader from "react-spinners/ScaleLoader"
import { useIsMobile } from "../../hooks/use-mobile";
import { useAuth } from "../../components/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "../../components/ui/dialog"
// import ChecklistComponent from "./checklist";
import { Button } from "../../components/ui/button";

//Ignore

const Schedule: React.FC = () => {
    //temp values
    const isMobile = useIsMobile();
    const construction = false;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); 
    const { userRole } = useAuth();

    if (construction) {
      return <div className="text-center text-lg font-bold p-4">Schedule Under Development!</div>;
    }
    else if (isMobile) {
      return <div className="text-center text-lg font-bold p-4">📵 Schedule on Mobile!</div>;
    }
    
  return (
    <div
      className="flex flex-col flex-1 p-2 mt-3 max-w-[1300px] mx-auto bg-gray-100 rounded-sm shadow-md overflow-x-auto"
      style={{
        minHeight: "calc(100vh - 150px)",
        maxHeight: "calc(100vh - 150px)",
      }}
    >
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-sm font-semibold overflow-y-hidden">
            <ScaleLoader color="#3b82f6" />
            <p className="mt-2">Loading Schedule...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center flex-1 text-sm font-semibold text-red-600">
            <p>Error: {error}</p>
          </div>
        ) : (
        <>
<div className="flex flex-col flex-1 bg-sidebar min-h-full overflow-y-hidden border-r shadow-md">

        {/* Side Bar Tabs */}
        <Tabs defaultValue="currentschedule" className="flex flex-row flex-1 min-h-full min-w-full gap-6 max-w-3xl pr-5">
            <TabsList className="flex min-h-[1000px] flex-col justify-start max-w-64 bg-muted/50 border-r-2 rounded-none">
                <div className="flex flex-row w-full items-center gap-2 text-black p-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-sm flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">Scheduling</h2> {/* Side Bar Header */}
                </div>
                <div className="border w-56 mb-5"></div>
                <TabsTrigger value="currentschedule" className="w-full justify-start data-[state=active]:bg-background">
                Current Schedule
                </TabsTrigger>
                <TabsTrigger value="hoursworked" className="w-full justify-start data-[state=active]:bg-background">
                Hours Worked
                </TabsTrigger>
            </TabsList>

            {/* Center of Page */}
            <div className="flex-1">
                <TabsContent value="currentschedule" className="my-2">
                <Card>
                <CardHeader className="flex flex-row">
                    <CardTitle>
                        Current Schedule
                        <p className="text-sm font-normal mt-1">Weekly/Monlthy Schedule</p>
                    </CardTitle>
                </CardHeader>
                    <CardContent>
                        <div> Current Schdule, maybe in table? Or import calender service? </div>
                    </CardContent>
                </Card>
                </TabsContent>
                <TabsContent value="hoursworked" className="my-2">
                <Card>
                <CardHeader className="flex flex-row">
                    <CardTitle>
                        Hours Worked
                        <p className="text-sm font-normal mt-1">How many hours worked through pay cycle</p>
                    </CardTitle>
                </CardHeader>
                    <CardContent>
                        <div>Date for when pay cycle starts and ends</div>
                    </CardContent>
                </Card>
                </TabsContent>
            </div>
        </Tabs>
        </div>
        </>
        )}
    </div>
  );
}

export default Schedule;
import React from "react";
import TicketList from "../../components/TicketList";

export const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quality Tickets</h1>
      
      <TicketList />
    </div>
  );
};

export default Home;
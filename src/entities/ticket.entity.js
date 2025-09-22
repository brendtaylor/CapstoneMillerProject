//Description: These are the object-oriented representations of the tables in the database. 
//Entity files define the structure of the data and the relationships between tables
//These are the ingredients in our analogy

const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Ticket", 
    tableName: "tickets", 
    columns: {
        id: {
            primary: true,      //primary key
            type: "int",        
            generated: true,    //auto generate a value for new tickets
        },
        title: {
            type: "varchar",
        },
        status: {
            type: "varchar",
            default: "Open",
        },
        description: {
            type: "text"
        }
    },
     //relations: {
       // description: {
         //  target: "Description",      // The name of the entity to link to
           // type: "one-to-one",         // The type of relationship
            //joinColumn: {
            //    name: "description_id" // The name for the new foreign key column in the 'tickets' table
            //},
            //cascade: true, // This automatically saves/updates the description
        //},
    //},
});
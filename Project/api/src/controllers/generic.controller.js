//*******************************************************************************************//
// This module contains a "controller factory" that creates controller objects for simple    //
// reference tables.                                                                         //
//                                                                                           //
// This avoids duplicating controller logic for every simple table.                          //
//                                                                                           //
// Called by routes/index.js                                                                 //
//*******************************************************************************************//

const { AppDataSource } = require("../data-source");
const { GenericService } = require("../services/generic.service");

//*******************************************************************************************//
// Creates a new controller object for a simple entity.                                      //
//                                                                                           //
// Parameters:                                                                               //
// entity - The entity definition to use (e.g., Division).                                   //
// searchColumn - The column to search (e.g., "divisionName").                               //
//                                                                                           //
// Output: a new object that acts as the controller for that entity definition               //
//*******************************************************************************************//
function createGenericController(entity, searchColumn) {
  const repository = AppDataSource.getRepository(entity);

  return {
    async getAll(req, res) {                                                                          //Function to handle GET requests for the entity
      try {
        const { search } = req.query;
        const results = await GenericService.findAll(repository, searchColumn, search);               //obtains the JSON array of data from a given table
        res.status(200).json(results);                                                                //Sends JSON array as HTTP response
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  };
}

module.exports = { createGenericController };
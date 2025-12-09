/**
 * @file generic.controller.js
 * This module contains a "controller factory" that creates controller objects for simple
 * reference tables. Only handles HTTP logic.
 *  -This avoids duplicating controller logic for every simple table.
 * 
 * Called by routes/index.js
 */

const { AppDataSource } = require("../data-source");
const { GenericService } = require("../services/generic.service");

/**
 * Creates a new controller object for a simple entity.
 * 
 * @param {Object} entity - The entity definition to use (ex: Division).
 * @param {string} searchColumn - The column to search (ex: "divisionName").
 * @returns {Object} A new object that acts as the controller for that entity definition.
 */
function createGenericController(entity, searchColumn) {
  const repository = AppDataSource.getRepository(entity);

  return {
    /**
     * Handles GET requests for the entity.
     * Obtains the JSON array of data from a given table and sends it as the HTTP response.
     * 
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    async getAll(req, res) {                                                                          
      try {
        const { search } = req.query;
        const results = await GenericService.findAll(repository, searchColumn, search);               
        res.status(200).json(results);                                                                
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  };
}

module.exports = { createGenericController };
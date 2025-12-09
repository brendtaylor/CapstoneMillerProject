/**
 * @file gener.service.js
 * This module covers all of the generic services that apply to a majority of the tables 
 * (ex: finding all objects in a table). Only handles Database Logic.
 * 
 * Called by generic.controller.js
 */

const { Like } = require("typeorm");                                                                                                      //provides partial string matching

class GenericService {
/**
   * Finds all entries in a table, with an optional search feature. 
   * If no search terms are entered, all entries in the table are returned. 
   * The search feature uses partial string matching to narrow results.
   * 
   * @param {Object} repository - The table repository to be queried.
   * @param {string} searchColumn - The name of the column in the table you want to search (ex: "divisionName").
   * @param {string} [searchTerm] - The user's search text (optional).
   * @returns {Promise<Array>} Raw data from the database in a JSON-compatible array.
   */
  static async findAll(repository, searchColumn, searchTerm) {
    if (searchTerm) {
      return repository.find({
        where: {
          [searchColumn]: Like(`%${searchTerm}%`)                                                                                       // Use computed property name to search the correct column
        }                                                                                                                               // Translates to something like "SELECT * FROM MiHub_Divisions WHERE "DIVISION_NAME" LIKE '%Flex%' "
      });
    } else {
      return repository.find();                                                                                                         // No search text = return all
    }
  }
}

module.exports = { GenericService };
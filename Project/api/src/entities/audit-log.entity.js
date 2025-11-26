const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "AuditLog",
  tableName: "AuditLogs",
  columns: {
    logId: {
      type: Number,
      primary: true,
      generated: true,
      name: "LOG_ID"
    },
    userId: {
      type: Number,
      nullable: false,
      name: "USER_ID"
    },
    ticketId: {
      type: Number,
      nullable: false,
      name: "TICKET_ID"
    },
    action: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "ACTION"
    },
    timestamp: {
      type: "datetime2",
      nullable: false,
      name: "TIMESTAMP"
    },
    woId: {
      type: Number,
      nullable: false,
      name: "WO_ID"
    }
  },
  relations: {
    user: {
      target: "User", // must match the entity name in user.entity.js
      type: "many-to-one",
      joinColumn: { name: "USER_ID" }
    },
    ticket: {
      target: "Ticket", // must match the entity name in ticket.entity.js
      type: "many-to-one",
      joinColumn: { name: "TICKET_ID" }
    }
  }
});

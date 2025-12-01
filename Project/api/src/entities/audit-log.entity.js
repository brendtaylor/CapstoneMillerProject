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
      nullable: true,
      name: "USER_ID"
    },
    userRole: {
      type: Number,   // tinyint in SQL maps to Number here
      nullable: true,
      name: "UserRole"
    },
    ticketId: {
      type: Number,
      nullable: true,
      name: "TICKET_ID"
    },
    woId: {
      type: Number,
      nullable: true,
      name: "WO_ID"
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
    }
  }
});

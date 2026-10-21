import { sequelize } from "../config/database.js";
import { initLoanModel, Loan } from "./Loan.js";
import { initUserModel, User } from "./User.js";

export const initializeModels = (): void => {
  initUserModel(sequelize);
  initLoanModel(sequelize);

  User.hasMany(Loan, {
    foreignKey: "userId",
    as: "loans",
    onDelete: "CASCADE",
  });

  Loan.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
};

export { sequelize, User, Loan };

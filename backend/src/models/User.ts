import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";
import type { Loan } from "./Loan.js";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare phoneNumber: string;
  declare createdAt: CreationOptional<Date>;
  declare Loans?: Loan[];
}

export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: "phone_number",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
      timestamps: true,
      updatedAt: false,
    },
  );

  return User;
};

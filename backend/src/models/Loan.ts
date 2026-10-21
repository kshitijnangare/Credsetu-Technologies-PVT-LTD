import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";
import type { User } from "./User.js";

export type LoanStatus = "PENDING" | "REPAID";

export class Loan extends Model<InferAttributes<Loan>, InferCreationAttributes<Loan>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare friendName: string;
  declare amount: number;
  declare dueDate: Date | string;
  declare status: CreationOptional<LoanStatus>;
  declare receiptUrl: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare User?: User;
}

export const initLoanModel = (sequelize: Sequelize): typeof Loan => {
  Loan.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      friendName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: "friend_name",
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "due_date",
      },
      status: {
        type: DataTypes.ENUM("PENDING", "REPAID"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "receipt_url",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "loans",
      modelName: "Loan",
      timestamps: true,
      underscored: true,
    },
  );

  return Loan;
};

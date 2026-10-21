import { Sequelize } from "sequelize";
import { env } from "./env.js";

const sslConfig = env.dbSsl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : undefined;

export const sequelize = env.databaseUrl
  ? new Sequelize(env.databaseUrl, {
      dialect: "postgres",
      logging: env.nodeEnv === "development" ? console.log : false,
      dialectOptions: sslConfig,
    })
  : new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
      host: env.dbHost,
      port: env.dbPort,
      dialect: "postgres",
      logging: env.nodeEnv === "development" ? console.log : false,
      dialectOptions: sslConfig,
    });

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
};

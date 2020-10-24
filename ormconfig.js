module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ["dist/**/*.entity{ .ts,.js}"],
  synchronize: false,
  migrationsTableName: 'nest_migrations',
  migrations: ['src/migrations/**/*.ts'],
  migrationsRun: true,
  cli: {
    migrationsDir: 'src/migrations'
  },
}
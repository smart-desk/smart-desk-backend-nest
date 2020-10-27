module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
  migrationsTableName: 'nest_migrations',
  migrations: ['src/migrations/**/*.{ts, js}'],
  migrationsRun: true,
  cli: {
    migrationsDir: 'src/migrations'
  },
}

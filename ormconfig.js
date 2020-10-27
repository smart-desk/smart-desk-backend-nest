module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.{ts, js}'],
  synchronize: false,
  migrationsTableName: 'nest_migrations',
  migrations: [__dirname + '/migrations/**/*.{ts, js}'],
  migrationsRun: true,
  cli: {
    migrationsDir: 'src/migrations'
  },
}

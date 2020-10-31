module.exports = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['dist/**/*.entity.js'],
    synchronize: false,
    migrationsTableName: 'nest_migrations',
    migrations: ['dist/migrations/**/*.js'],
    migrationsRun: true,
    cli: {
        migrationsDir: 'dist/migrations',
    },
};

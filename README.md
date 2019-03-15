![](doc/videos/ayapingping.mp4)

# Aya Ping Ping Framework


Hello there, we're under maintaining the Framework documentation, and gonna done as soon as possible. This framework will continue to update as we learning everyday about new way to efficiency, and how to make a work being more simply to do.



### Migration Guide
- Initialize

        node_modules/.bin/sequelize init

- Create Model

        node_modules/.bin/sequelize model:generate --name Test --attributes name:string,value:string,

- Running Migrations

        node_modules/.bin/sequelize db:migrate

- Undoing Migrations

        node_modules/.bin/sequelize db:migrate:undo

- Undoing All Migrations

        node_modules/.bin/sequelize db:migrate:undo:all

- Undoing Specified Migrations

        node_modules/.bin/sequelize db:migrate:undo --to XXXXXXXXXXXXXX-create-test.js

### Seeder Guide
- Create Seed

        node_modules/.bin/sequelize seed:generate --name demo-test

- Running Seeds

        node_modules/.bin/sequelize db:seed:all

- Undoing Recent Seeds

        node_modules/.bin/sequelize db:seed:undo

- Undoing All Seeds

        node_modules/.bin/sequelize db:seed:undo:all
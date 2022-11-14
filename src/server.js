const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '44b4268d-7893-4e1f-8ab9-0ac75f2165a1',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route(routes);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
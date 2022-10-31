import { fastify as _fastify } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { Type } from "@sinclair/typebox";

const PORT = 3370;

(async function main() {
    const logger: PinoLoggerOptions = { transport: { target: "pino-pretty", options: { translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o", ignore: "pid,hostname", }, }};
    const fastify = _fastify({ logger }).withTypeProvider<TypeBoxTypeProvider>();

    const openapiRoutePrefix = "/documentation";
    fastify.register(fastifySwagger);
    fastify.register(fastifySwaggerUi, { routePrefix: openapiRoutePrefix, uiConfig: { displayOperationId: true, }, });

    fastify.register((fastify, opts, done) => {
        const RefSchema = Type.String({ $id: "RefSchema" });
    
        const FailingSchema1 = Type.Object({
            id: Type.Union([Type.String(), Type.Number()]),
            reference: Type.Ref(RefSchema),
        }, { $id: "FailingSchema1" });

        const WorkingSchema1 = Type.Object({
            id: Type.Union([Type.String(), Type.Number()]),
            notReference: Type.String(),
        }, { $id: "WorkingSchema1" });
        
        const WorkingSchema2 = Type.Object({
            array: Type.Array(Type.Number()),
            reference: Type.Ref(RefSchema),
        }, { $id: "WorkingSchema2" });

        const FailingSchema2 = Type.Object({
            array: Type.Array(Type.Union([Type.String(), Type.Number()])),
            reference: Type.Ref(RefSchema),
        }, { $id: "FailingSchema2" });
    
        const tags = ["controller"];
    
        fastify.addSchema(RefSchema);
        fastify.addSchema(FailingSchema1);
        fastify.addSchema(WorkingSchema1);
        fastify.addSchema(WorkingSchema2);
        fastify.addSchema(FailingSchema2);
    
        fastify.get(
            '/fails1',
            { schema: { tags, response: { 200: FailingSchema1, }, }, },
            async (request, reply) => reply.send({ id: 1, reference: "hi", }),
        );
        fastify.get(
            '/works1',
            { schema: { tags, response: { 200: WorkingSchema1, }, }, },
            async (request, reply) => reply.send({ id: 1, notReference: "hello", }),
        );
        fastify.get(
            '/works2',
            { schema: { tags, response: { 200: WorkingSchema2, }, }, },
            async (request, reply) => reply.send({ array: [0], reference: "hi", }),
        );
        fastify.get(
            '/fails2',
            { schema: { tags, response: { 200: FailingSchema2, }, }, },
            async (request, reply) => reply.send({ array: [0], reference: "hi", }),
        );
        
        done();
    });

    try {
        await fastify.listen({ port: PORT, host: "::", });
        fastify.log.info(`Swagger UI: http://localhost:${PORT}${openapiRoutePrefix}`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
    
})();
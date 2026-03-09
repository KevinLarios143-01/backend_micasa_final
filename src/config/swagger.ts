import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MICASA - API de Gestión de Iglesia',
    version: '1.0.0',
    description: 'API RESTful para la gestión integral de una iglesia, incluyendo personas, usuarios, roles, permisos, ministerios, familias, contactos, eventos y asistencias.',
    contact: {
      name: 'Equipo MICASA',
      email: 'soporte@micasa.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
    {
      url: process.env.API_URL_PRODUCTION || 'https://api.micasa.com',
      description: 'Servidor de producción',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido del endpoint /api/auth/login. Incluir en el header Authorization como: Bearer {token}',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Mensaje de error',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      PaginationMetadata: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total de registros',
            example: 100,
          },
          page: {
            type: 'integer',
            description: 'Página actual',
            example: 1,
          },
          limit: {
            type: 'integer',
            description: 'Registros por página',
            example: 10,
          },
          totalPages: {
            type: 'integer',
            description: 'Total de páginas',
            example: 10,
          },
          hasNextPage: {
            type: 'boolean',
            description: 'Indica si hay página siguiente',
            example: true,
          },
          hasPrevPage: {
            type: 'boolean',
            description: 'Indica si hay página anterior',
            example: false,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticación faltante o inválido',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Token inválido o expirado',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'No tiene permisos para realizar esta acción',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'No tiene permisos para realizar esta acción',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Recurso no encontrado',
            },
          },
        },
      },
      ValidationError: {
        description: 'Error de validación de datos',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Error de validación',
              details: [
                {
                  field: 'email',
                  message: 'Formato de email inválido',
                },
              ],
            },
          },
        },
      },
      ConflictError: {
        description: 'Conflicto con el estado actual del recurso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Ya existe un registro con ese valor',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Error interno del servidor',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Error interno del servidor',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Autenticación',
      description: 'Endpoints para autenticación y gestión de sesiones',
    },
    {
      name: 'Personas',
      description: 'Gestión de personas de la iglesia',
    },
    {
      name: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
    },
    {
      name: 'Roles',
      description: 'Gestión de roles y permisos',
    },
    {
      name: 'Permisos',
      description: 'Gestión de permisos del sistema',
    },
    {
      name: 'Ministerios',
      description: 'Gestión de ministerios y sus miembros',
    },
    {
      name: 'Familias',
      description: 'Gestión de familias y relaciones familiares',
    },
    {
      name: 'Contactos',
      description: 'Gestión de contactos adicionales de personas',
    },
    {
      name: 'Eventos',
      description: 'Gestión de eventos y asistencias',
    },
    {
      name: 'Auditoría',
      description: 'Consulta de registros de auditoría',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Configura y monta la documentación Swagger en la aplicación Express
 * @param app - Instancia de Express
 */
export const setupSwagger = (app: Express): void => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MICASA API Documentation',
  };

  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export default swaggerSpec;

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear permisos base
  console.log('Creando permisos...');
  const permisos = await Promise.all([
    // Personas
    prisma.permisos.upsert({
      where: { nombre: 'PERSONAS_CREATE' },
      update: {},
      create: { nombre: 'PERSONAS_CREATE', descripcion: 'Crear personas', modulo: 'PERSONAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERSONAS_READ' },
      update: {},
      create: { nombre: 'PERSONAS_READ', descripcion: 'Leer personas', modulo: 'PERSONAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERSONAS_UPDATE' },
      update: {},
      create: { nombre: 'PERSONAS_UPDATE', descripcion: 'Actualizar personas', modulo: 'PERSONAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERSONAS_DELETE' },
      update: {},
      create: { nombre: 'PERSONAS_DELETE', descripcion: 'Eliminar personas', modulo: 'PERSONAS' },
    }),
    // Usuarios
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_CREATE' },
      update: {},
      create: { nombre: 'USUARIOS_CREATE', descripcion: 'Crear usuarios', modulo: 'USUARIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_READ' },
      update: {},
      create: { nombre: 'USUARIOS_READ', descripcion: 'Leer usuarios', modulo: 'USUARIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_UPDATE' },
      update: {},
      create: { nombre: 'USUARIOS_UPDATE', descripcion: 'Actualizar usuarios', modulo: 'USUARIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_DELETE' },
      update: {},
      create: { nombre: 'USUARIOS_DELETE', descripcion: 'Eliminar usuarios', modulo: 'USUARIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_ASSIGN_ROLE' },
      update: {},
      create: { nombre: 'USUARIOS_ASSIGN_ROLE', descripcion: 'Asignar roles', modulo: 'USUARIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'USUARIOS_REMOVE_ROLE' },
      update: {},
      create: { nombre: 'USUARIOS_REMOVE_ROLE', descripcion: 'Remover roles', modulo: 'USUARIOS' },
    }),
    // Roles
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_CREATE' },
      update: {},
      create: { nombre: 'ROLES_CREATE', descripcion: 'Crear roles', modulo: 'ROLES' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_READ' },
      update: {},
      create: { nombre: 'ROLES_READ', descripcion: 'Leer roles', modulo: 'ROLES' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_UPDATE' },
      update: {},
      create: { nombre: 'ROLES_UPDATE', descripcion: 'Actualizar roles', modulo: 'ROLES' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_DELETE' },
      update: {},
      create: { nombre: 'ROLES_DELETE', descripcion: 'Eliminar roles', modulo: 'ROLES' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_ASSIGN_PERMISSION' },
      update: {},
      create: { nombre: 'ROLES_ASSIGN_PERMISSION', descripcion: 'Asignar permisos', modulo: 'ROLES' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'ROLES_REMOVE_PERMISSION' },
      update: {},
      create: { nombre: 'ROLES_REMOVE_PERMISSION', descripcion: 'Remover permisos', modulo: 'ROLES' },
    }),
    // Permisos
    prisma.permisos.upsert({
      where: { nombre: 'PERMISOS_CREATE' },
      update: {},
      create: { nombre: 'PERMISOS_CREATE', descripcion: 'Crear permisos', modulo: 'PERMISOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERMISOS_READ' },
      update: {},
      create: { nombre: 'PERMISOS_READ', descripcion: 'Leer permisos', modulo: 'PERMISOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERMISOS_UPDATE' },
      update: {},
      create: { nombre: 'PERMISOS_UPDATE', descripcion: 'Actualizar permisos', modulo: 'PERMISOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'PERMISOS_DELETE' },
      update: {},
      create: { nombre: 'PERMISOS_DELETE', descripcion: 'Eliminar permisos', modulo: 'PERMISOS' },
    }),
    // Auditoría
    prisma.permisos.upsert({
      where: { nombre: 'AUDITORIA_READ' },
      update: {},
      create: { nombre: 'AUDITORIA_READ', descripcion: 'Leer auditoría', modulo: 'AUDITORIA' },
    }),
    // Ministerios
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_CREATE' },
      update: {},
      create: { nombre: 'MINISTERIOS_CREATE', descripcion: 'Crear ministerios', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_READ' },
      update: {},
      create: { nombre: 'MINISTERIOS_READ', descripcion: 'Leer ministerios', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_UPDATE' },
      update: {},
      create: { nombre: 'MINISTERIOS_UPDATE', descripcion: 'Actualizar ministerios', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_DELETE' },
      update: {},
      create: { nombre: 'MINISTERIOS_DELETE', descripcion: 'Eliminar ministerios', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_ASSIGN_MEMBER' },
      update: {},
      create: { nombre: 'MINISTERIOS_ASSIGN_MEMBER', descripcion: 'Asignar miembros', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_REMOVE_MEMBER' },
      update: {},
      create: { nombre: 'MINISTERIOS_REMOVE_MEMBER', descripcion: 'Remover miembros', modulo: 'MINISTERIOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'MINISTERIOS_UPDATE_MEMBER' },
      update: {},
      create: { nombre: 'MINISTERIOS_UPDATE_MEMBER', descripcion: 'Actualizar miembros', modulo: 'MINISTERIOS' },
    }),
    // Familias
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_CREATE' },
      update: {},
      create: { nombre: 'FAMILIAS_CREATE', descripcion: 'Crear familias', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_READ' },
      update: {},
      create: { nombre: 'FAMILIAS_READ', descripcion: 'Leer familias', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_UPDATE' },
      update: {},
      create: { nombre: 'FAMILIAS_UPDATE', descripcion: 'Actualizar familias', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_DELETE' },
      update: {},
      create: { nombre: 'FAMILIAS_DELETE', descripcion: 'Eliminar familias', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_ADD_MEMBER' },
      update: {},
      create: { nombre: 'FAMILIAS_ADD_MEMBER', descripcion: 'Agregar miembros', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_REMOVE_MEMBER' },
      update: {},
      create: { nombre: 'FAMILIAS_REMOVE_MEMBER', descripcion: 'Remover miembros', modulo: 'FAMILIAS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'FAMILIAS_UPDATE_MEMBER' },
      update: {},
      create: { nombre: 'FAMILIAS_UPDATE_MEMBER', descripcion: 'Actualizar miembros', modulo: 'FAMILIAS' },
    }),
    // Contactos
    prisma.permisos.upsert({
      where: { nombre: 'CONTACTOS_CREATE' },
      update: {},
      create: { nombre: 'CONTACTOS_CREATE', descripcion: 'Crear contactos', modulo: 'CONTACTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'CONTACTOS_READ' },
      update: {},
      create: { nombre: 'CONTACTOS_READ', descripcion: 'Leer contactos', modulo: 'CONTACTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'CONTACTOS_UPDATE' },
      update: {},
      create: { nombre: 'CONTACTOS_UPDATE', descripcion: 'Actualizar contactos', modulo: 'CONTACTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'CONTACTOS_DELETE' },
      update: {},
      create: { nombre: 'CONTACTOS_DELETE', descripcion: 'Eliminar contactos', modulo: 'CONTACTOS' },
    }),
    // Eventos
    prisma.permisos.upsert({
      where: { nombre: 'EVENTOS_CREATE' },
      update: {},
      create: { nombre: 'EVENTOS_CREATE', descripcion: 'Crear eventos', modulo: 'EVENTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'EVENTOS_READ' },
      update: {},
      create: { nombre: 'EVENTOS_READ', descripcion: 'Leer eventos', modulo: 'EVENTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'EVENTOS_UPDATE' },
      update: {},
      create: { nombre: 'EVENTOS_UPDATE', descripcion: 'Actualizar eventos', modulo: 'EVENTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'EVENTOS_DELETE' },
      update: {},
      create: { nombre: 'EVENTOS_DELETE', descripcion: 'Eliminar eventos', modulo: 'EVENTOS' },
    }),
    prisma.permisos.upsert({
      where: { nombre: 'EVENTOS_REGISTER_ATTENDANCE' },
      update: {},
      create: { nombre: 'EVENTOS_REGISTER_ATTENDANCE', descripcion: 'Registrar asistencias', modulo: 'EVENTOS' },
    }),
  ]);

  console.log(`✅ ${permisos.length} permisos creados`);

  // Crear rol de Administrador
  console.log('Creando rol Administrador...');
  const adminRole = await prisma.roles.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
    },
  });

  // Asignar todos los permisos al rol Administrador
  console.log('Asignando permisos al rol Administrador...');
  for (const permiso of permisos) {
    await prisma.roles_permisos.upsert({
      where: {
        id_rol_id_permiso: {
          id_rol: adminRole.id_rol,
          id_permiso: permiso.id_permiso,
        },
      },
      update: {},
      create: {
        id_rol: adminRole.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }

  console.log('✅ Permisos asignados al rol Administrador');

  // Crear persona administrador
  console.log('Creando persona administrador...');
  const adminPersona = await prisma.personas.upsert({
    where: { identificacion: '0000000000' },
    update: {},
    create: {
      primer_nombre: 'Admin',
      primer_apellido: 'Sistema',
      fecha_nacimiento: new Date('1990-01-01'),
      genero: 'M',
      identificacion: '0000000000',
      tipo_identificacion: 'CC',
      estado_civil: 'S',
      email: 'admin@micasa.com',
    },
  });

  console.log('✅ Persona administrador creada');

  // Crear usuario administrador
  console.log('Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.usuarios.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      id_persona: adminPersona.id_persona,
      usuario: 'admin',
      clave: hashedPassword,
    },
  });

  console.log('✅ Usuario administrador creado');

  // Asignar rol Administrador al usuario
  console.log('Asignando rol Administrador al usuario...');
  await prisma.usuarios_roles.upsert({
    where: {
      id_usuario_id_rol: {
        id_usuario: adminUser.id_usuario,
        id_rol: adminRole.id_rol,
      },
    },
    update: {},
    create: {
      id_usuario: adminUser.id_usuario,
      id_rol: adminRole.id_rol,
    },
  });

  console.log('✅ Rol asignado al usuario administrador');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de acceso:');
  console.log('   Usuario: admin');
  console.log('   Contraseña: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

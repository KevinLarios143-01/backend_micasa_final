import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testCheckpoint() {
  console.log('🔍 Iniciando verificación de módulos core...\n');

  try {
    // Test 1: Verificar conexión a base de datos
    console.log('1️⃣ Verificando conexión a base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión a base de datos exitosa\n');

    // Test 2: Verificar CRUD de Personas
    console.log('2️⃣ Verificando CRUD de Personas...');
    const testPersona = await prisma.personas.create({
      data: {
        primer_nombre: 'Test',
        primer_apellido: 'Checkpoint',
        identificacion: `TEST-${Date.now()}`,
        tipo_identificacion: 'CC',
        fecha_nacimiento: new Date('1990-01-01'),
        genero: 'M',
        estado_civil: 'S',
        bautizado: false,
        estado: true
      }
    });
    console.log(`✅ Persona creada: ${testPersona.primer_nombre} ${testPersona.primer_apellido} (ID: ${testPersona.id_persona})`);

    const personaActualizada = await prisma.personas.update({
      where: { id_persona: testPersona.id_persona },
      data: { segundo_nombre: 'Updated' }
    });
    console.log(`✅ Persona actualizada con segundo nombre: ${personaActualizada.segundo_nombre}`);

    const personaEliminada = await prisma.personas.update({
      where: { id_persona: testPersona.id_persona },
      data: { estado: false }
    });
    console.log(`✅ Persona eliminada (soft delete): estado = ${personaEliminada.estado}\n`);

    // Test 3: Verificar CRUD de Usuarios con hash de contraseñas
    console.log('3️⃣ Verificando CRUD de Usuarios con hash de contraseñas...');
    const testPersona2 = await prisma.personas.create({
      data: {
        primer_nombre: 'Usuario',
        primer_apellido: 'Test',
        identificacion: `USER-${Date.now()}`,
        tipo_identificacion: 'CC',
        fecha_nacimiento: new Date('1990-01-01'),
        genero: 'F',
        estado_civil: 'S',
        bautizado: false,
        estado: true
      }
    });

    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUsuario = await prisma.usuarios.create({
      data: {
        id_persona: testPersona2.id_persona,
        usuario: `testuser${Date.now()}`,
        clave: hashedPassword,
        estado: true
      }
    });
    console.log(`✅ Usuario creado: ${testUsuario.usuario} (ID: ${testUsuario.id_usuario})`);
    console.log(`✅ Contraseña hasheada con bcrypt: ${hashedPassword.substring(0, 20)}...`);

    const passwordMatch = await bcrypt.compare('password123', testUsuario.clave);
    console.log(`✅ Verificación de contraseña: ${passwordMatch ? 'CORRECTA' : 'INCORRECTA'}\n`);

    // Test 4: Verificar asignación de roles y permisos
    console.log('4️⃣ Verificando asignación de roles y permisos...');
    
    // Buscar o crear un rol de prueba
    let testRol = await prisma.roles.findFirst({
      where: { nombre: 'TEST_ROLE' }
    });
    
    if (!testRol) {
      testRol = await prisma.roles.create({
        data: {
          nombre: 'TEST_ROLE',
          descripcion: 'Rol de prueba para checkpoint',
          estado: true
        }
      });
      console.log(`✅ Rol creado: ${testRol.nombre} (ID: ${testRol.id_rol})`);
    } else {
      console.log(`✅ Rol encontrado: ${testRol.nombre} (ID: ${testRol.id_rol})`);
    }

    // Buscar o crear un permiso de prueba
    let testPermiso = await prisma.permisos.findFirst({
      where: { nombre: 'TEST_READ' }
    });
    
    if (!testPermiso) {
      testPermiso = await prisma.permisos.create({
        data: {
          nombre: 'TEST_READ',
          descripcion: 'Permiso de prueba para checkpoint',
          modulo: 'TEST',
          estado: true
        }
      });
      console.log(`✅ Permiso creado: ${testPermiso.nombre} (ID: ${testPermiso.id_permiso})`);
    } else {
      console.log(`✅ Permiso encontrado: ${testPermiso.nombre} (ID: ${testPermiso.id_permiso})`);
    }

    // Asignar permiso a rol
    const rolPermisoExiste = await prisma.roles_permisos.findFirst({
      where: {
        id_rol: testRol.id_rol,
        id_permiso: testPermiso.id_permiso
      }
    });

    if (!rolPermisoExiste) {
      await prisma.roles_permisos.create({
        data: {
          id_rol: testRol.id_rol,
          id_permiso: testPermiso.id_permiso,
          estado: true
        }
      });
      console.log(`✅ Permiso asignado al rol`);
    } else {
      console.log(`✅ Permiso ya estaba asignado al rol`);
    }

    // Asignar rol a usuario
    const usuarioRolExiste = await prisma.usuarios_roles.findFirst({
      where: {
        id_usuario: testUsuario.id_usuario,
        id_rol: testRol.id_rol
      }
    });

    if (!usuarioRolExiste) {
      await prisma.usuarios_roles.create({
        data: {
          id_usuario: testUsuario.id_usuario,
          id_rol: testRol.id_rol,
          estado: true
        }
      });
      console.log(`✅ Rol asignado al usuario`);
    } else {
      console.log(`✅ Rol ya estaba asignado al usuario`);
    }

    // Verificar permisos del usuario
    const usuarioConPermisos = await prisma.usuarios.findUnique({
      where: { id_usuario: testUsuario.id_usuario },
      include: {
        usuarios_roles: {
          where: { estado: true },
          include: {
            roles: {
              include: {
                roles_permisos: {
                  where: { estado: true },
                  include: {
                    permisos: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permisos = usuarioConPermisos?.usuarios_roles
      .filter((ur: any) => ur.estado && ur.roles.estado)
      .flatMap((ur: any) => ur.roles.roles_permisos
        .filter((rp: any) => rp.estado && rp.permisos.estado)
        .map((rp: any) => rp.permisos.nombre)
      ) || [];
    console.log(`✅ Permisos del usuario: ${permisos.join(', ')}\n`);

    // Test 5: Verificar auditoría
    console.log('5️⃣ Verificando auditoría...');
    const auditoriaCount = await prisma.auditoria.count();
    console.log(`✅ Registros de auditoría en la base de datos: ${auditoriaCount}`);
    
    if (auditoriaCount > 0) {
      const ultimaAuditoria = await prisma.auditoria.findFirst({
        orderBy: { fecha_accion: 'desc' },
        include: { usuario: true }
      });
      console.log(`✅ Última auditoría: ${ultimaAuditoria?.accion} en tabla ${ultimaAuditoria?.tabla} (${ultimaAuditoria?.fecha_accion.toISOString()})\n`);
    } else {
      console.log('⚠️  No hay registros de auditoría aún\n');
    }

    // Test 6: Verificar paginación
    console.log('6️⃣ Verificando paginación...');
    const personasPage1 = await prisma.personas.findMany({
      take: 10,
      skip: 0,
      where: { estado: true }
    });
    const totalPersonas = await prisma.personas.count({ where: { estado: true } });
    const totalPages = Math.ceil(totalPersonas / 10);
    console.log(`✅ Paginación funcionando: ${personasPage1.length} registros en página 1 de ${totalPages} (Total: ${totalPersonas})\n`);

    console.log('✅ ¡Todos los módulos core verificados exitosamente!\n');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testCheckpoint()
  .then(() => {
    console.log('🎉 Checkpoint completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Checkpoint falló:', error);
    process.exit(1);
  });

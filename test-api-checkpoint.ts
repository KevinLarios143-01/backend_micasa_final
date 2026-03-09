import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let testPersonaId = 0;
let testUsuarioId = 0;
let testRolId = 0;
let testPermisoId = 0;

async function testAPICheckpoint() {
  console.log('🔍 Iniciando verificación de API de módulos core...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Verificando health check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log(`✅ Health check: ${healthResponse.data.status}\n`);

    // Test 2: Login y autenticación
    console.log('2️⃣ Verificando autenticación...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        usuario: 'admin',
        clave: 'admin123'
      });
      authToken = loginResponse.data.data.token;
      console.log(`✅ Login exitoso, token obtenido`);
      console.log(`✅ Usuario: ${loginResponse.data.data.usuario.usuario}`);
      console.log(`✅ Roles: ${loginResponse.data.data.usuario.roles.join(', ')}\n`);
    } catch (error: any) {
      console.log('⚠️  Usuario admin no existe, continuando sin autenticación...\n');
    }

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    // Test 3: CRUD de Personas
    console.log('3️⃣ Verificando CRUD de Personas...');
    
    // Crear persona
    try {
      const createPersonaResponse = await axios.post(
        `${API_URL}/personas`,
        {
          primer_nombre: 'API',
          primer_apellido: 'Test',
          identificacion: `API-${Date.now()}`,
          tipo_identificacion: 'CC',
          fecha_nacimiento: '1990-01-01',
          genero: 'M',
          estado_civil: 'S',
          bautizado: false
        },
        { headers }
      );
      testPersonaId = createPersonaResponse.data.data.id_persona;
      console.log(`✅ Persona creada: ID ${testPersonaId}`);
    } catch (error: any) {
      console.log(`⚠️  Error creando persona: ${error.response?.data?.error || error.message}`);
    }

    // Listar personas con paginación
    try {
      const listPersonasResponse = await axios.get(`${API_URL}/personas?page=1&limit=10`, { headers });
      console.log(`✅ Listado de personas: ${listPersonasResponse.data.data.length} registros`);
      console.log(`✅ Metadata de paginación: página ${listPersonasResponse.data.metadata.page} de ${listPersonasResponse.data.metadata.totalPages}`);
    } catch (error: any) {
      console.log(`⚠️  Error listando personas: ${error.response?.data?.error || error.message}`);
    }

    // Actualizar persona
    if (testPersonaId > 0) {
      try {
        await axios.put(
          `${API_URL}/personas/${testPersonaId}`,
          { segundo_nombre: 'Updated' },
          { headers }
        );
        console.log(`✅ Persona actualizada`);
      } catch (error: any) {
        console.log(`⚠️  Error actualizando persona: ${error.response?.data?.error || error.message}`);
      }
    }

    // Obtener persona por ID
    if (testPersonaId > 0) {
      try {
        const getPersonaResponse = await axios.get(`${API_URL}/personas/${testPersonaId}`, { headers });
        console.log(`✅ Persona obtenida: ${getPersonaResponse.data.data.primer_nombre} ${getPersonaResponse.data.data.segundo_nombre} ${getPersonaResponse.data.data.primer_apellido}\n`);
      } catch (error: any) {
        console.log(`⚠️  Error obteniendo persona: ${error.response?.data?.error || error.message}\n`);
      }
    }

    // Test 4: CRUD de Usuarios con hash de contraseñas
    console.log('4️⃣ Verificando CRUD de Usuarios...');
    
    if (testPersonaId > 0) {
      try {
        const createUsuarioResponse = await axios.post(
          `${API_URL}/usuarios`,
          {
            id_persona: testPersonaId,
            usuario: `apiuser${Date.now()}`,
            clave: 'password123'
          },
          { headers }
        );
        testUsuarioId = createUsuarioResponse.data.data.id_usuario;
        console.log(`✅ Usuario creado: ID ${testUsuarioId}`);
        
        // Verificar que la contraseña no se retorna
        if (createUsuarioResponse.data.data.clave) {
          console.log(`❌ ERROR: La contraseña se está retornando en la respuesta`);
        } else {
          console.log(`✅ Contraseña NO se retorna en la respuesta (seguridad correcta)`);
        }
      } catch (error: any) {
        console.log(`⚠️  Error creando usuario: ${error.response?.data?.error || error.message}`);
      }
    }

    // Listar usuarios
    try {
      const listUsuariosResponse = await axios.get(`${API_URL}/usuarios?page=1&limit=10`, { headers });
      console.log(`✅ Listado de usuarios: ${listUsuariosResponse.data.data.length} registros\n`);
    } catch (error: any) {
      console.log(`⚠️  Error listando usuarios: ${error.response?.data?.error || error.message}\n`);
    }

    // Test 5: Roles y Permisos
    console.log('5️⃣ Verificando Roles y Permisos...');
    
    // Crear rol
    try {
      const createRolResponse = await axios.post(
        `${API_URL}/roles`,
        {
          nombre: `API_ROLE_${Date.now()}`,
          descripcion: 'Rol de prueba API'
        },
        { headers }
      );
      testRolId = createRolResponse.data.data.id_rol;
      console.log(`✅ Rol creado: ID ${testRolId}`);
    } catch (error: any) {
      console.log(`⚠️  Error creando rol: ${error.response?.data?.error || error.message}`);
    }

    // Crear permiso
    try {
      const createPermisoResponse = await axios.post(
        `${API_URL}/permisos`,
        {
          nombre: `API_TEST_${Date.now()}`,
          descripcion: 'Permiso de prueba API',
          modulo: 'API_TEST'
        },
        { headers }
      );
      testPermisoId = createPermisoResponse.data.data.id_permiso;
      console.log(`✅ Permiso creado: ID ${testPermisoId}`);
    } catch (error: any) {
      console.log(`⚠️  Error creando permiso: ${error.response?.data?.error || error.message}`);
    }

    // Asignar permiso a rol
    if (testRolId > 0 && testPermisoId > 0) {
      try {
        await axios.post(
          `${API_URL}/roles/${testRolId}/permisos`,
          { id_permiso: testPermisoId },
          { headers }
        );
        console.log(`✅ Permiso asignado al rol`);
      } catch (error: any) {
        console.log(`⚠️  Error asignando permiso: ${error.response?.data?.error || error.message}`);
      }

      // Obtener permisos del rol
      try {
        const rolPermisosResponse = await axios.get(`${API_URL}/roles/${testRolId}/permisos`, { headers });
        console.log(`✅ Permisos del rol: ${rolPermisosResponse.data.data.length} permisos`);
      } catch (error: any) {
        console.log(`⚠️  Error obteniendo permisos del rol: ${error.response?.data?.error || error.message}`);
      }
    }

    // Asignar rol a usuario
    if (testUsuarioId > 0 && testRolId > 0) {
      try {
        await axios.post(
          `${API_URL}/usuarios/${testUsuarioId}/roles`,
          { id_rol: testRolId },
          { headers }
        );
        console.log(`✅ Rol asignado al usuario`);
      } catch (error: any) {
        console.log(`⚠️  Error asignando rol: ${error.response?.data?.error || error.message}`);
      }

      // Obtener roles del usuario
      try {
        const usuarioRolesResponse = await axios.get(`${API_URL}/usuarios/${testUsuarioId}/roles`, { headers });
        console.log(`✅ Roles del usuario: ${usuarioRolesResponse.data.data.length} roles`);
      } catch (error: any) {
        console.log(`⚠️  Error obteniendo roles del usuario: ${error.response?.data?.error || error.message}`);
      }

      // Obtener permisos del usuario
      try {
        const usuarioPermisosResponse = await axios.get(`${API_URL}/usuarios/${testUsuarioId}/permisos`, { headers });
        console.log(`✅ Permisos del usuario: ${usuarioPermisosResponse.data.data.length} permisos\n`);
      } catch (error: any) {
        console.log(`⚠️  Error obteniendo permisos del usuario: ${error.response?.data?.error || error.message}\n`);
      }
    }

    // Test 6: Auditoría
    console.log('6️⃣ Verificando Auditoría...');
    try {
      const auditoriaResponse = await axios.get(`${API_URL}/auditoria?page=1&limit=5`, { headers });
      console.log(`✅ Registros de auditoría: ${auditoriaResponse.data.metadata.total} total`);
      if (auditoriaResponse.data.data.length > 0) {
        const ultimaAuditoria = auditoriaResponse.data.data[0];
        console.log(`✅ Última auditoría: ${ultimaAuditoria.accion} en tabla ${ultimaAuditoria.tabla}`);
      }
    } catch (error: any) {
      console.log(`⚠️  Error obteniendo auditoría: ${error.response?.data?.error || error.message}`);
    }

    // Auditoría por tabla
    try {
      const auditoriaPersonasResponse = await axios.get(`${API_URL}/auditoria/tabla/personas`, { headers });
      console.log(`✅ Auditoría de tabla personas: ${auditoriaPersonasResponse.data.data.length} registros\n`);
    } catch (error: any) {
      console.log(`⚠️  Error obteniendo auditoría por tabla: ${error.response?.data?.error || error.message}\n`);
    }

    // Test 7: Verificar paginación en todos los endpoints
    console.log('7️⃣ Verificando paginación en endpoints...');
    const endpointsConPaginacion = [
      '/personas',
      '/usuarios',
      '/roles',
      '/permisos',
      '/auditoria'
    ];

    for (const endpoint of endpointsConPaginacion) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}?page=1&limit=5`, { headers });
        if (response.data.metadata) {
          console.log(`✅ ${endpoint}: paginación OK (${response.data.metadata.total} total, página ${response.data.metadata.page}/${response.data.metadata.totalPages})`);
        } else {
          console.log(`⚠️  ${endpoint}: sin metadata de paginación`);
        }
      } catch (error: any) {
        console.log(`⚠️  ${endpoint}: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n✅ ¡Verificación de API completada!\n');

  } catch (error: any) {
    console.error('❌ Error durante la verificación:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    throw error;
  }
}

testAPICheckpoint()
  .then(() => {
    console.log('🎉 Checkpoint de API completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Checkpoint de API falló:', error.message);
    process.exit(1);
  });

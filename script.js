const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

const ENDPOINTS = {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    PROJECTS: `${API_BASE}/projects`
};


const projectsPanel = document.getElementById('projectsPanel');
const addProjectBtn = document.getElementById('addProjectBtn');
const addProjectFormContainer = document.getElementById('addProjectFormContainer');
const projectForm = document.getElementById('projectForm');
const projectMessage = document.getElementById('projectMessage');
const logoutBtn = document.querySelector('#home.view a.btn-logout');


const navigateTo = (hash) => {
    window.location.hash = hash;
};

const getToken = () => localStorage.getItem('authToken');


const checkAccess = () => {
    const targetHash = window.location.hash;
    const isHome = targetHash === '#home';
    const loginMessage = document.getElementById('loginMessage');
    const isLoggedIn = getToken();

    if (isHome && !isLoggedIn) {
        window.location.hash = '#login';
        if (loginMessage) {
            loginMessage.style.color = '#DC3545';
            loginMessage.textContent = 'Debes iniciar sesión para acceder al panel de control.';
        }
    } else {
        if (loginMessage) loginMessage.textContent = '';
        const registerMessage = document.getElementById('registerMessage');
        if (registerMessage) registerMessage.textContent = '';
        
        if (isHome && isLoggedIn) {
            loadProjects();
        }
    }
};


const registerForm = document.querySelector('#register.view form'); 
const registerMessage = document.getElementById('registerMessage');

registerForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    registerMessage.textContent = 'Registrando usuario...';
    registerMessage.style.color = '#007BFF';

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const itsonId = document.getElementById('reg-itsonId').value; // CAMPO CORREGIDO
    
    if (name.length < 6 || email.length === 0 || password.length < 6 || itsonId.length !== 6) {
        registerMessage.style.color = '#DC3545';
        registerMessage.textContent = 'Verifica que el ID ITSON tenga 6 caracteres y los demás campos sean correctos.';
        return;
    }

    try {
        const response = await fetch(ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, itsonId })
        });
        const data = await response.json();

        if (response.ok) {
            registerMessage.style.color = '#28A745';
            registerMessage.textContent = 'Registro exitoso. Serás redirigido al Login.';
            setTimeout(() => {
                navigateTo('login');
                const loginMessage = document.getElementById('loginMessage');
                if (loginMessage) {
                    loginMessage.style.color = '#28A745';
                    loginMessage.textContent = 'Registro exitoso. Introduce tus credenciales.';
                }
            }, 1500);
        } else {
            registerMessage.style.color = '#DC3545';
            registerMessage.textContent = `Error al registrar: ${data.message || 'Error desconocido'}`;
        }
    } catch (error) {
        registerMessage.style.color = '#DC3545';
        registerMessage.textContent = 'Error de red. Verifica la conexión.';
    }
});


const loginForm = document.querySelector('#login.view form'); 
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 
    loginMessage.textContent = 'Iniciando sesión...';
    loginMessage.style.color = '#007BFF';

    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;
    
    try {
        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Guardar Token
                loginMessage.style.color = '#28A745';
                loginMessage.textContent = 'Acceso concedido. Redirigiendo...';
                setTimeout(() => {
                    navigateTo('home');
                }, 1000);
            } else {
                loginMessage.style.color = '#DC3545';
                loginMessage.textContent = 'Respuesta de API incompleta: No se recibió token.';
            }
        } else {
            loginMessage.style.color = '#DC3545';
            loginMessage.textContent = `Error de credenciales: ${data.message || 'Verifica correo y contraseña.'}`;
        }
    } catch (error) {
        loginMessage.style.color = '#DC3545';
        loginMessage.textContent = 'Error de red. Verifica la conexión.';
    }
});


if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
        addProjectFormContainer.style.display = 
            addProjectFormContainer.style.display === 'none' ? 'block' : 'none';
        projectForm.reset();
        projectMessage.textContent = '';
        projectForm.dataset.projectId = ''; // Limpiar ID para asegurar que sea CREATE
        document.querySelector('#projectForm button[type="submit"]').textContent = 'Guardar Proyecto';
        document.querySelector('#addProjectFormContainer h3').textContent = 'Añadir Proyecto';
    });
}


const renderProject = (project) => {
    return `
        <div class="project-item" data-id="${project._id}">
            <div style="text-align: left;">
                <h3>${project.title || 'Sin título'}</h3>
                <p style="font-size: 0.9em; font-weight: normal; color: #6C757D;">${project.description || 'Sin descripción'}</p>
            </div>
            <div class="project-actions">
                <button class="btn btn-secondary update-btn" data-action="edit" data-id="${project._id}" data-title="${project.title}" data-description="${project.description}" style="padding: 5px 10px; margin-right: 5px; background-color: #FFC107;">
                    Actualizar
                </button>
                <button class="btn btn-secondary delete-btn" data-action="delete" data-id="${project._id}" style="padding: 5px 10px; background-color: #DC3545;">
                    Eliminar
                </button>
            </div>
        </div>
    `;
};


const loadProjects = async () => {
    projectsPanel.innerHTML = '<p style="text-align: center; color: #6C757D;">Cargando proyectos...</p>';
    const token = getToken();
    if (!token) {
        projectsPanel.innerHTML = '<p style="text-align: center; color: #DC3545;">Error: No autorizado. Inicia sesión.</p>';
        return;
    }

    try {
        const response = await fetch(ENDPOINTS.PROJECTS, {
            method: 'GET',
            headers: { 'auth-token': `${token}` }
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
            if (data.length > 0) {
                projectsPanel.innerHTML = data.map(renderProject).join('');
                attachProjectActionListeners(); 
            } else {
                projectsPanel.innerHTML = '<p style="text-align: center; color: #6C757D;">No hay proyectos registrados. ¡Agrega el primero!</p>';
            }
        } else {
             projectsPanel.innerHTML = `<p style="text-align: center; color: #DC3545;">Error al cargar: ${data.message || 'Token inválido o error en la API.'}</p>`;
        }
    } catch(error) {
        projectsPanel.innerHTML = '<p style="text-align: center; color: #DC3545;">Error de red al obtener proyectos.</p>';
    }
};


if (projectForm) {
    projectForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const token = getToken();
        if (!token) return;

        const title = document.getElementById('project-name').value;
        const description = document.getElementById('project-description').value;
        const projectId = projectForm.dataset.projectId;
        
        let method = 'POST';
        let url = ENDPOINTS.PROJECTS;
        let actionMsg = 'Guardando';

        if (projectId) {
            method = 'PUT';
            url = `${ENDPOINTS.PROJECTS}/${projectId}`;
            actionMsg = 'Actualizando';
        }

        projectMessage.textContent = `${actionMsg} proyecto...`;
        projectMessage.style.color = '#007BFF';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${token}`
                },
                body: JSON.stringify({ title, description }) 
            });
            const data = await response.json();

            if (response.ok) {
                projectMessage.style.color = '#28A745';
                projectMessage.textContent = `Proyecto ${projectId ? 'actualizado' : 'guardado'} con éxito.`;
                projectForm.reset();
                projectForm.dataset.projectId = '';
                document.querySelector('#addProjectFormContainer h3').textContent = 'Añadir Proyecto';
                document.querySelector('#projectForm button[type="submit"]').textContent = 'Guardar Proyecto';
                addProjectFormContainer.style.display = 'none';
                loadProjects();
            } else {
                projectMessage.style.color = '#DC3545';
                projectMessage.textContent = `Error al ${actionMsg.toLowerCase()}: ${data.message || 'Error desconocido.'}`;
            }
        } catch(error) {
            projectMessage.style.color = '#DC3545';
            projectMessage.textContent = 'Error de red al procesar proyecto.';
        }
    });
}


const handleEdit = (element) => {
    const projectId = element.dataset.id;
    const title = element.dataset.title;
    const description = element.dataset.description;

    document.getElementById('project-name').value = title;
    document.getElementById('project-description').value = description;
    
    projectForm.dataset.projectId = projectId;
    
    document.querySelector('#projectForm button[type="submit"]').textContent = 'Guardar Cambios';
    document.querySelector('#addProjectFormContainer h3').textContent = 'Editar Proyecto';
    
    addProjectFormContainer.style.display = 'block';
    projectMessage.textContent = 'Modificando proyecto existente...';
    projectMessage.style.color = '#007BFF';
    window.scrollTo(0, 0); // Desplazar hacia arriba
};


const handleDelete = async (element) => {
    const projectId = element.dataset.id;
    const token = getToken();

    if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto con ID ${projectId}?`)) {
        return;
    }

    try {
        const response = await fetch(`${ENDPOINTS.PROJECTS}/${projectId}`, {
            method: 'DELETE',
            headers: { 'auth-token': `${token}` }
        });
        
        if (response.ok) {
            alert('Proyecto eliminado con éxito.');
            loadProjects(); // Recargar la lista
        } else {
            const data = await response.json();
            alert(`Error al eliminar: ${data.message || 'Error desconocido.'}`);
        }
    } catch (error) {
        alert('Error de red al intentar eliminar el proyecto.');
    }
};


const attachProjectActionListeners = () => {
    projectsPanel.querySelectorAll('.project-actions button').forEach(button => {
        button.removeEventListener('click', handleProjectAction); 
        button.addEventListener('click', handleProjectAction);
    });
};

const handleProjectAction = (event) => {
    const action = event.target.dataset.action;
    if (action === 'edit') {
        handleEdit(event.target);
    } else if (action === 'delete') {
        handleDelete(event.target);
    }
};


if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('authToken');
        navigateTo('login');
    });
}


window.addEventListener('load', function() {
    if (!window.location.hash) {
        navigateTo('login');
    }
    checkAccess();
});

window.addEventListener('hashchange', checkAccess);
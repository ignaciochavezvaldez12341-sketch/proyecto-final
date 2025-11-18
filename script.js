const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

const ENDPOINTS = {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    PROJECTS: `${API_BASE}/projects`
};

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
    const itsonId = '000000';

    if (name.length < 6 || email.length === 0 || password.length < 6) {
        registerMessage.style.color = '#DC3545';
        registerMessage.textContent = 'Verifica que el nombre y la contraseña tengan mínimo 6 caracteres.';
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
                localStorage.setItem('authToken', data.token);
                
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
        


const projectsPanel = document.getElementById('projectsPanel');
const addProjectBtn = document.getElementById('addProjectBtn');
const addProjectFormContainer = document.getElementById('addProjectFormContainer');
const projectForm = document.getElementById('projectForm');
const projectMessage = document.getElementById('projectMessage');
const logoutBtn = document.querySelector('#home.view a.btn-logout');

if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
        addProjectFormContainer.style.display = 
            addProjectFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

const renderProject = (project) => {
    return `
        <div class="project-item" data-id="${project._id || 'temp-id'}">
            <div style="text-align: left;">
                <h3>${project.title || 'Sin título'}</h3>
                <p style="font-size: 0.9em; font-weight: normal; color: #6C757D;">${project.description || 'Sin descripción'}</p>
            </div>
            <div class="project-actions">
                <button class="btn btn-secondary update-btn" data-id="${project._id}" style="padding: 5px 10px; margin-right: 5px; background-color: #FFC107;">
                    Actualizar
                </button>
                <button class="btn btn-secondary delete-btn" data-id="${project._id}" style="padding: 5px 10px; background-color: #DC3545;">
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
            headers: {
                'auth-token': `${token}` 
            }
        });
        
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
            if (data.length > 0) {
                projectsPanel.innerHTML = data.map(renderProject).join('');
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
        projectMessage.textContent = 'Guardando proyecto...';
        projectMessage.style.color = '#007BFF';
        
        const token = getToken();
        if (!token) {
            projectMessage.textContent = 'Error: Sesión expirada. Por favor, inicia sesión de nuevo.';
            projectMessage.style.color = '#DC3545';
            return;
        }

        const title = document.getElementById('project-name').value;
        const description = document.getElementById('project-description').value;
        
        try {
            const response = await fetch(ENDPOINTS.PROJECTS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${token}` 
                },
                body: JSON.stringify({ title, description, technologies: [] }) 
            });
            
            const data = await response.json();

            if (response.ok) {
                projectMessage.style.color = '#28A745';
                projectMessage.textContent = 'Proyecto guardado con éxito.';
                projectForm.reset();
                loadProjects();
            } else {
                projectMessage.style.color = '#DC3545';
                projectMessage.textContent = `Error al guardar: ${data.message || 'Error desconocido.'}`;
            }
        } catch(error) {
            projectMessage.style.color = '#DC3545';
            projectMessage.textContent = 'Error de red al guardar proyecto.';
        }
    });
}

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
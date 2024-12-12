// Constants
const API_BASE_URL = 'http://ec2-54-90-250-174.compute-1.amazonaws.com:80';
let STUDENT_ID = '';

// Function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/loginPage.html');
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Function to create a card
function createCard(team) {
    const card = document.createElement('div');
    card.className = 'col-md-6 mb-4';

    const cardContent = `
        <div class="card shadow ${team.hasRequestPending ? 'border-success' : ''}" id="teamCard-${team._id}">
            <div class="card-body ${team.hasRequestPending ? 'text-success' : ''}">
                <h5 class="card-title">${team.teamName}</h5>
                <p class="card-text">${team.description}</p>
                <div class="d-flex mb-3">
                    ${team.majors.map(major => `
                        <div class="badge bg-outline-success rounded-circle me-2" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                            ${major}
                        </div>
                    `).join('')}
                </div>
                ${!team.hasRequestPending ? 
                    `<button class="btn btn-success w-100" onclick="requestToJoin('${team._id}', '${team.teamName}')">
                        Request to Join
                    </button>` : 
                    '<div class="text-success text-center">Request Pending</div>'
                }
            </div>
        </div>
    `;

    card.innerHTML = cardContent;
    return card;
}

// Function to render cards
function renderCards(teamsData) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = ''; // Clear existing content
    teamsData.forEach(team => {
        cardContainer.appendChild(createCard(team));
    });
}

// Function to fetch teams from the server
function fetchTeams() {
    STUDENT_ID = localStorage.getItem('user_id');
    if (!STUDENT_ID) {
        window.location.replace('/loginPage.html');
        return;
    }

    const placeholders = document.querySelectorAll('.placeholder-card');
    placeholders.forEach(card => card.style.display = 'block');
    
    fetch(`${API_BASE_URL}/team/all/${STUDENT_ID}`, {
        headers: getAuthHeaders()
    })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.replace('/loginPage.html');
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            
            placeholders.forEach(card => card.style.display = 'none');
            const cardContainer = document.getElementById('cardContainer');
            
            if (!data || data.length === 0) {
                cardContainer.innerHTML = `
                    <div class="col-12 text-center mt-5">
                        <div class="alert alert-info p-4" role="alert">
                            <i class="bi bi-info-circle fs-3 mb-3 d-block"></i>
                            <h4 class="alert-heading">No Teams Available</h4>
                            <p class="mb-0">There are currently no team proposals to join. Check back later!</p>
                        </div>
                    </div>`;
                return;
            }
            
            renderCards(data);
        })
        .catch(error => {
            console.error('Error fetching teams:', error);
            const cardContainer = document.getElementById('cardContainer');
            cardContainer.innerHTML = '<div class="alert alert-danger">Error loading teams. Please try again later.</div>';
            placeholders.forEach(card => card.style.display = 'none');
        });
}

// Move requestToJoin to global scope
function requestToJoin(teamId, teamName) {
    fetch(`http://ec2-54-90-250-174.compute-1.amazonaws.com:80/team/join/${teamId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            studentId: STUDENT_ID
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Refetch teams to update UI with latest status
            fetchTeams();
            showRequestToast(teamName);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error joining team:', error);
        alert('Failed to send join request. Please try again.');
    });
}

// Add showRequestToast function
function showRequestToast(teamName) {
    const toastBody = document.getElementById('toastBody');
    if (!toastBody) {
        console.error('Toast element not found');
        return;
    }
    
    toastBody.textContent = `Request to join ${teamName} has been sent.`;
    const toastElement = document.getElementById('requestToast');
    const toastInstance = bootstrap.Toast.getOrCreateInstance(toastElement);

    // Hide the toast first if it's currently visible
    toastElement.classList.remove('show');
    setTimeout(() => {
        toastInstance.show();
    }, 10); // Small delay to ensure the toast is properly reset
}

// Handle auth check on DOM load
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/loginPage.html');
        return;
    }

    try {
        // Verify token on load
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!verifyResponse.ok) {
            localStorage.removeItem('token');
            window.location.replace('/loginPage.html');
            return;
        }

        // Initialize app if token is valid
        STUDENT_ID = localStorage.getItem('user_id');
        fetchTeams();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        window.location.replace('/loginPage.html');
    }
});
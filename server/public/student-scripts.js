// student-scripts.js

// Constants
const API_BASE_URL = 'http://ec2-54-90-250-174.compute-1.amazonaws.com:80';
let STUDENT_ID = '';
let hasTeam = false;
let teamId = null;

// Add auth check and token handling
document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/loginPage.html');
        return;
    }

    try {
        // Verify token on load
        const verifyResponse = await fetch('http://ec2-54-90-250-174.compute-1.amazonaws.com:80/auth/verify', {
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
        await initializeApp();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        window.location.replace('/loginPage.html');
    }
});

// Add at top of file after constants
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

// Fetch initial data
async function initializeApp() {
    await Promise.all([
        getStudentProfile(),
        checkTeamStatus()
    ]);

    updateUIState();
}


function updateUIState() {
    const noTeamContent = document.getElementById('noTeamContent');
    const teamContent = document.getElementById('teamContent');

    if (hasTeam) {
        noTeamContent.classList.add('d-none');
        teamContent.classList.remove('d-none');
    } else {
        noTeamContent.classList.remove('d-none');
        teamContent.classList.add('d-none');
    }
}

// Profile editing functionality
const editProfileForm = document.getElementById('editProfileForm');
const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));

async function handleProfileSubmit(event) {
    event.preventDefault();
    const submitButton = editProfileForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        // Get form data
        const formData = {
            name: editProfileForm.profileName.value.trim(),
            whatsappNumber: editProfileForm.profileWhatsApp.value.trim(),
            major: editProfileForm.profileMajor.value.trim(),
            description: editProfileForm.profileDescription.value.trim()
        };

        // Validate
        if (!formData.name || !formData.whatsappNumber || !formData.major) {
            throw new Error('Please fill all required fields');
        }

        // API call
        const response = await fetch(`${API_BASE_URL}/student/profile/${STUDENT_ID}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/loginPage.html';
                return;
            }
            throw new Error('Failed to update profile');
        }

        // Update UI
        updateProfileUI(formData);
        editProfileModal.hide();
        alert('Profile updated successfully');

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to update profile');
    } finally {
        submitButton.disabled = false;
    }
}

function updateProfileUI(data) {
    const userInfo = document.getElementById('userInfo');
    userInfo.querySelector('h2 strong').textContent = data.name;
    userInfo.querySelector('p:nth-child(2)').textContent = `WhatsApp: ${data.whatsappNumber}`;
    userInfo.querySelector('p:nth-child(3)').textContent = `Major: ${data.major}`;
    userInfo.querySelector('p:nth-child(4)').textContent = data.description;
}

// Event listeners
editProfileForm.addEventListener('submit', handleProfileSubmit);

document.getElementById('editProfileBtn').addEventListener('click', () => {
    const userInfo = document.getElementById('userInfo').children;

    editProfileForm.profileName.value = userInfo[0].firstChild.textContent;
    editProfileForm.profileWhatsApp.value = userInfo[1].textContent.replace('WhatsApp: ', '');
    editProfileForm.profileMajor.value = userInfo[2].textContent.replace('Major: ', '');
    editProfileForm.profileDescription.value = userInfo[3].textContent;

    editProfileModal.show();
});

// Profile picture functionality
const editProfilePicModalElement = document.getElementById('editProfilePicModal');
const editProfilePicModal = new bootstrap.Modal(editProfilePicModalElement);
const editProfilePicForm = document.getElementById('editProfilePicForm');
const profilePic = document.getElementById('profilePic');
const newProfileImageInput = document.getElementById('newProfileImage');

document.getElementById('editProfilePicture').addEventListener('click', function () {
    editProfilePicModal.show();
});

// Create team button handler
// document.querySelector('#createTeamBtn').addEventListener('click', async function () {
//     try {
//         const response = await fetch(`${API_BASE_URL}/student/team/create`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 teamName: "New Team", // Default name
//                 description: "Team description",
//                 majors: ["Computer Science"], // Default major
//                 studentId: STUDENT_ID,
//                 members: [STUDENT_ID],
//                 pendingRequests: []
//             })
//         });

//         if (!response.ok) {
//             throw new Error('Failed to create team');
//         }

//         const data = await response.json();
//         console.log('Team created:', data);

//         // Update UI state
//         hasTeam = true;
//         updateUIState();

//         // Redirect to team formation page
//         // window.location.href = 'TeamFormationPage.html';

//     } catch (error) {
//         console.error('Error creating team:', error);
//         alert('Failed to create team. Please try again.');
//     }
// });

// Form submissions
document.getElementById('editProfileForm').addEventListener('submit', handleProfileSubmit);
document.getElementById('editProfilePicForm').addEventListener('submit', handleProfilePicSubmit);

async function checkTeamStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/student/team/${STUDENT_ID}`, {
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/loginPage.html');
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch team status');
        }

        const data = await response.json();
        hasTeam = data.hasTeam;

        if (hasTeam) {
            // Populate team data
            populateTeamData(data.team);
            teamId = data.team._id;
        }

        updateUIState();

    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('401')) {
            localStorage.removeItem('token');
            window.location.replace('/loginPage.html');
        }
    }
}

function populateTeamData(team) {
    // Populate team members
    const teamMembersContainer = document.querySelector('#myTeamMembers .card-body');
    teamMembersContainer.innerHTML = ''; // Clear existing content

    team.members.forEach(member => {
        const memberCard = createMemberCard(member);
        teamMembersContainer.appendChild(memberCard);
    });

    // Populate pending requests
    const pendingRequestsContainer = document.querySelector('#pendingRequests .card-body');
    pendingRequestsContainer.innerHTML = ''; // Clear existing content

    team.pendingRequests.forEach(request => {
        const requestCard = createRequestCard(request);
        pendingRequestsContainer.appendChild(requestCard);
    });
}

function createMemberCard(member) {
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-3';
    div.innerHTML = `
        <img src="person.svg" class="rounded-circle me-3" alt="Member Picture">
        <div class="details" onclick="showStudentInfo(this, '${member.description}')">
            <h5 class="mb-1">${member.name}</h5>
            <p class="mb-1">Major: ${member.major}</p>
        </div>
        <div class="ms-auto d-flex flex-wrap gap-2">
            <a href="https://wa.me/${member.whatsappNumber}" target="_blank">
                <button class="btn btn-outline-success btn-sm btn-md-normal me-2">
                    <i class="fab fa-whatsapp"></i>
                </button>
            </a>
            <button class="btn btn-outline-danger btn-sm btn-md-normal delete-member" 
                onclick="deleteMember('${member._id}', '${member.name}',this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function createRequestCard(request) {

    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-3';
    div.innerHTML = `
        <img src="person.svg" class="rounded-circle me-3" alt="Member Picture">
        <div class="details" onclick="showStudentInfo(this, ${JSON.stringify(request.description)})">
            <h5 class="mb-1">${request.name}</h5>
            <p class="mb-1">Major: ${request.major}</p>
        </div>
        <div class="ms-auto d-flex flex-wrap gap-2">
            <a href="https://wa.me/${request.whatsappNumber}" target="_blank">
                <button class="btn btn-outline-success btn-sm btn-md-normal me-2">
                    <i class="fab fa-whatsapp"></i>
                </button>
            </a>
            <button class="btn btn-outline-success btn-sm btn-md-normal me-md-2" 
                onclick="acceptRequest('${request._id}', '${request.name}',this)">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm btn-md-normal" 
                onclick="deleteRequest('${request._id}', '${request.name}',this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function handleProfilePicSubmit(event) {
    event.preventDefault();
    // Profile pic update logic
}



function deleteTeam() {
    if (confirm('Are you sure you want to delete the team?')) {
        hasTeam = false;
        updateUIState();
    }
}

function addTeamMember(memberDetails) {
    const teamMembersContainer = document.querySelector('#myTeamMembers .card-body');
    const newMemberCard = document.createElement('div');
    newMemberCard.className = 'd-flex align-items-center mb-3';
    // Add member card HTML
}

async function getStudentProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('/loginPage.html');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/student/profile/${STUDENT_ID}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/loginPage.html';
                return;
            }
            throw new Error('Failed to fetch profile');
        }

        const profile = await response.json();
        populateProfileData(profile);

    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to load profile data');
    }
}

function populateProfileData(profile) {
    // Update profile picture
    const profilePic = document.getElementById('profilePic');
    if (profile.profilePicture) {
        profilePic.src = profile.profilePicture;
    }

    // Update user info
    const userInfo = document.getElementById('userInfo');
    userInfo.querySelector('h2 strong').textContent = profile.name;
    userInfo.querySelector('p:nth-child(2)').textContent = `WhatsApp: ${profile.whatsappNumber}`;
    userInfo.querySelector('p:nth-child(3)').textContent = `Major: ${profile.major}`;
    userInfo.querySelector('p:nth-child(4)').textContent = profile.description;

    // Pre-populate edit form fields
    document.getElementById('profileName').value = profile.name;
    document.getElementById('profileWhatsApp').value = profile.whatsappNumber;
    document.getElementById('profileMajor').value = profile.major;
    document.getElementById('profileDescription').value = profile.description;
}

async function exitTeam() {
    try {
        const response = await fetch(`${API_BASE_URL}/student/team/${teamId}/leave/${STUDENT_ID}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/loginPage.html';
                return;
            }
            throw new Error('Failed to leave team');
        }

        hasTeam = false;
        updateUIState();
        alert('Successfully left the team');
    } catch (error) {
        console.error('Error leaving team:', error);
        alert('Failed to leave team. Please try again.');
    }
}

// Attach exit team handler
console.log("attaching exit team handler");
document.getElementById("ExitBtn").addEventListener('click', async () => {
    try {
        // Get team ID from state
        console.log("reached here");
        const response = await fetch(`${API_BASE_URL}/student/team/${STUDENT_ID}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!data.hasTeam) {
            throw new Error('Not in a team');
        }

        const teamId = data.team._id;

        // Call leave team endpoint
        const leaveResponse = await fetch(
            `${API_BASE_URL}/student/team/${teamId}/leave/${STUDENT_ID}`,
            {
                method: 'DELETE',
                headers: getAuthHeaders()
            }
        );

        if (!leaveResponse.ok) {
            throw new Error('Failed to leave team');
        }

        // Update UI state
        hasTeam = false;
        updateUIState();

        // Show success message
        alert('Successfully left the team');

    } catch (error) {
        console.error('Error leaving team:', error);
        alert('Failed to leave team. Please try again.');
    }
});


// Handler functions (defined in global scope)
async function deleteMember(memberId, memberName, element) {
    try {
        if (confirm(`Remove ${memberName} from team?`)) {
            const response = await fetch(
                `${API_BASE_URL}/student/team/${teamId}/leave/${memberId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );
            if (!response.ok) throw new Error('Failed to remove member');
            console.log("element", element);
            element.parentElement.parentElement.remove();
        }
    } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member');
    }
}

async function acceptRequest(requestId, requestName, element) {
    try {
        if (confirm(`Accept request from ${requestName}?`)) {
            const response = await fetch(
                `${API_BASE_URL}/student/team/${teamId}/accept/${requestId}`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );
            if (!response.ok) throw new Error('Failed to accept request');
            await checkTeamStatus(); // Refresh team data
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        alert('Failed to accept request');
    }
}

async function deleteRequest(requestId, requestName, element) {
    try {
        if (confirm(`Reject request from ${requestName}?`)) {
            const response = await fetch(
                `${API_BASE_URL}/student/team/${teamId}/reject/${requestId}`,
                {
                    method: 'POST',
                    headers: getAuthHeaders()
                }
            );
            if (!response.ok) throw new Error('Failed to reject request');
            element.parentElement.parentElement.remove();
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Failed to reject request');
    }
}

// Initialize modal
const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));

// Add click handlers for student cards
function showStudentInfo(detailsElement, description) {
    const name = detailsElement.querySelector('h5').textContent;
    const major = detailsElement.querySelector('p').textContent.replace('Major: ', '');

    // Update modal content
    document.getElementById('infoModalLabel').textContent = name;
    document.querySelector('#infoModal .student-description').textContent =
        description;

    infoModal.show();
}

// Initialize modal
const createTeamModal = new bootstrap.Modal(document.getElementById('createTeamModal'));

// Show modal when create team button clicked
document.getElementById('createTeamBtn').addEventListener('click', () => {
    createTeamModal.show();
});

// Handle form submission
document.getElementById('createTeamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        // Get and verify token
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        // Get all majors
        const majors = [];
        for (let i = 1; i <= 6; i++) {
            const major = document.getElementById(`major${i}`).value;
            if (!major) {
                throw new Error(`Please select Major ${i}`);
            }
            majors.push(major);
        }

        const teamData = {
            teamName: document.getElementById('teamName').value.trim(),
            description: document.getElementById('teamDescription').value.trim(),
            majors: majors,
            studentId: STUDENT_ID,
            members: [STUDENT_ID]
        };

        const response = await fetch(`${API_BASE_URL}/student/team/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(teamData)
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/loginPage.html');
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to create team');
        }

        const data = await response.json();
        hasTeam = true;
        teamId = data._id;
        checkTeamStatus();
        updateUIState();
        createTeamModal.hide();
        alert('Team created successfully!');

    } catch (error) {
        console.error('Error creating team:', error);
        if (error.message === 'Not authenticated') {
            window.location.replace('/loginPage.html');
        } else {
            alert(error.message || 'Failed to create team');
        }
    } finally {
        submitBtn.disabled = false;
    }
});

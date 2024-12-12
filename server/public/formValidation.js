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

document.querySelector('.form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Get form inputs (keeping your existing validation)
    const name = document.getElementById('new-name').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const whatsappNumber = document.getElementById('whatsapp-number').value.trim();
    const major = document.getElementById('university-major').value.trim();
    const description = document.getElementById('description').value.trim();
    const batchYear = document.getElementById('batch-year').value.trim();
    const password = document.getElementById('new-password').value.trim();

    // Regular expressions for validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const whatsappPattern = /^[0-9]+$/;
    const batchYearPattern = /^[0-9]{4}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{9,}$/;

    // Validate inputs
    if (!name) {
        alert('Please enter your name.');
        return;
    } else if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    } else if (!whatsappPattern.test(whatsappNumber)) {
        alert('Please enter a valid WhatsApp number.');
        return;
    } else if (!major) {
        alert('Please enter your university major.');
        return;
    } else if (!description) {
        alert('Please enter a description.');
        return;
    } else if (!batchYearPattern.test(batchYear)) {
        alert('Please enter a valid batch year.');
        return;
    } else if (!passwordPattern.test(password)) {
        alert('Password must be at least 9 characters long, include a number and a capital letter.');
        return;
    }

    // If validation passes, submit to backend
    try {
        const response = await fetch("http://ec2-54-90-250-174.compute-1.amazonaws.com:80/auth/create-account", {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name,
                email,
                whatsappNumber,
                major,
                description,
                batchYear,
                password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Account created successfully!');
            window.location.href = 'loginPage.html';
        } else {
            alert(data.error || 'An error occurred');
        }
    } catch (error) {
        alert('An error occurred while connecting to the server');
        console.error('Error:', error);
    }
});

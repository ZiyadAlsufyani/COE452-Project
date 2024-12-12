document.addEventListener('DOMContentLoaded', function () {
    var addUserForm = document.getElementById('addUserForm');
    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var profileImageInput = document.getElementById('profileImage');
    var profileImagePreview = document.getElementById('profileImagePreview');
    var addUserForm = document.getElementById('addUserForm');
    var newProfileImageInput = document.getElementById('newProfileImage');
    var profilePic = document.getElementById('profilePic');
    var editProfileForm = document.getElementById('editProfileForm');

    var passwordHelp = document.createElement('div');
    passwordHelp.className = 'invalid-feedback';
    passwordInput.parentNode.appendChild(passwordHelp);

    var currentDeleteItem = null; // Track the current item to be deleted

    // Real-time validation for username
    usernameInput.addEventListener('input', function () {
        if (usernameInput.value.trim() === '') {
            usernameInput.classList.add('is-invalid');
        } else {
            usernameInput.classList.remove('is-invalid');
            usernameInput.classList.add('is-valid');
        }
    });

    // Real-time validation for password
    passwordInput.addEventListener('input', function () {
        var passwordValid = validatePassword(passwordInput.value.trim());
        if (!passwordValid.isValid) {
            passwordInput.classList.add('is-invalid');
            passwordHelp.innerHTML = passwordValid.message.join('<br>');
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            passwordHelp.innerHTML = '';
        }
    });

    profileImageInput.addEventListener('change', function () {
        const file = profileImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    editProfileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!editProfileForm.checkValidity()) {
            e.stopPropagation();
        } else {
            const file = newProfileImageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePic.src = e.target.result;
                    profilePic.style.width = '100px';
                    profilePic.style.height = '100px';
                };
                reader.readAsDataURL(file);
            }
            // Hide the modal
            const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editProfileModal.hide();
        }
        editProfileForm.classList.add('was-validated');
    });

    addUserForm.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        // Validate username
        if (usernameInput.value.trim() === '') {
            usernameInput.classList.add('is-invalid');
        } else {
            usernameInput.classList.remove('is-invalid');
            usernameInput.classList.add('is-valid');
        }

        // Validate password
        var passwordValid = validatePassword(passwordInput.value.trim());
        if (!passwordValid.isValid) {
            passwordInput.classList.add('is-invalid');
            passwordHelp.innerHTML = passwordValid.message.join('<br>');
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
        }

        if (addUserForm.checkValidity() === false || !passwordValid.isValid) {
            addUserForm.classList.add('was-validated');
        } else {
            addUser(usernameInput.value.trim());
            // Clear the input fields
            usernameInput.value = '';
            passwordInput.value = '';
            profileImageInput.value = null;
            profileImagePreview.src = "https://via.placeholder.com/40"
            usernameInput.classList.remove('is-valid');
            passwordInput.classList.remove('is-valid');
            addUserForm.classList.remove('was-validated');
        }
    }, false);

    function validatePassword(password) {
        var minLength = 8;
        var hasUpperCase = /[A-Z]/.test(password);
        var hasLowerCase = /[a-z]/.test(password);
        var hasNumbers = /\d/.test(password);
        var hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        var errors = [];
        if (password.length < minLength) {
            errors.push('Password must be at least 8 characters long.');
        }
        if (!hasUpperCase) {
            errors.push('Password must contain an uppercase letter.');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain a lowercase letter.');
        }
        if (!hasNumbers) {
            errors.push('Password must contain a number.');
        }
        if (!hasSpecialChars) {
            errors.push('Password must contain a special character.');
        }

        return {
            isValid: errors.length === 0,
            message: errors
        };
    }

    const sampleUsers = [
        { username: 'User1', imgSrc: 'https://via.placeholder.com/40' },
        { username: 'User2', imgSrc: 'https://via.placeholder.com/40' },
    ];
    function loadSampleUsers() {
        sampleUsers.forEach(user => addUser(user.username, user.imgSrc));
    }

    loadSampleUsers();

    function showDeleteToast(item) {
        currentDeleteItem = item;
        const toast = new bootstrap.Toast(document.getElementById('deleteToast'));
        toast.show();
    }

    function deleteUser() {
        if (currentDeleteItem) {
            currentDeleteItem.parentNode.removeChild(currentDeleteItem);
            const toast = bootstrap.Toast.getInstance(document.getElementById('deleteToast'));
            toast.hide();
            currentDeleteItem = null;
        }
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteUser);

    function addUser(username) {
        var userCardBody = document.querySelector('.user-card .card-body');

        var userItem = document.createElement('div');
        userItem.className = 'user-item';

        var userContent = document.createElement('div');
        userContent.className = 'd-flex align-items-center';

        var userImage = document.createElement('img');
        userImage.src = profileImagePreview.src;
        userImage.alt = username;
        userImage.className = 'me-3';

        var userNameSpan = document.createElement('span');
        userNameSpan.textContent = username;

        userContent.appendChild(userImage);
        userContent.appendChild(userNameSpan);

        var deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

        deleteButton.addEventListener('click', function () {
            showDeleteToast(userItem);
        });

        userItem.appendChild(userContent);
        userItem.appendChild(deleteButton);

        userCardBody.appendChild(userItem);
    }
});
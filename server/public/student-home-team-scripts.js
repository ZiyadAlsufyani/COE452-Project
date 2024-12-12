document.addEventListener('DOMContentLoaded', function() {
    const modalElement = document.getElementById('infoModal');
    const modal = new bootstrap.Modal(modalElement);

    document.querySelectorAll('.details').forEach(function(card) {
        card.addEventListener('click', function() {
            let name = this.children[0].textContent;
            modalElement.querySelector('.modal-title').textContent = name;
            modal.show();
        });
    });

    const editProfileModalElement = document.getElementById('editProfileModal');
    const editProfileModal = new bootstrap.Modal(editProfileModalElement);

    document.getElementById('editProfileBtn').addEventListener('click', function() {
        // Extract current profile information from the HTML
        const userInfo = document.getElementById('userInfo').children;
        const name = userInfo[0].firstChild.textContent;
        const whatsNum = userInfo[1].textContent.replace('WhatsApp: ', '');
        const major = userInfo[2].textContent.replace('Major: ', '');
        const profileDescription = userInfo[3].textContent;

        // Populate the modal fields with the current profile information
        document.getElementById('profileName').value = name;
        document.getElementById('profileWhatsApp').value = whatsNum;
        document.getElementById('profileMajor').value = major;
        document.getElementById('profileDescription').value = profileDescription;

        editProfileModal.show();
    });

    document.getElementById('editProfileForm').addEventListener('submit', function(event) {
        event.preventDefault();
        let name = document.getElementById('profileName').value;
        let whatsNum = document.getElementById('profileWhatsApp').value;
        let major = document.getElementById('profileMajor').value;
        let profileDescription = document.getElementById('profileDescription').value;
        let userInfo = document.getElementById('userInfo').children;
        userInfo[0].firstChild.textContent = name;
        userInfo[1].textContent = 'WhatsApp: ' + whatsNum;
        userInfo[2].textContent = 'Major: ' + major;
        userInfo[3].textContent = profileDescription;
        editProfileModal.hide();
    });

    document.querySelectorAll('.delete').forEach(function(button) {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete?')) {
                this.closest('.d-flex.align-items-center.mb-3').remove();
            }
        });
    });

    document.querySelectorAll('.accept').forEach(function(button) {
        button.addEventListener('click', function() {
            const memberCard = this.closest('.d-flex.align-items-center.mb-3');
            const memberDetails = memberCard.querySelector('.details').innerHTML;
            const newMemberCard = document.createElement('div');
            newMemberCard.className = 'd-flex align-items-center mb-3';
            newMemberCard.innerHTML = `
                <img src="person.svg" class="rounded-circle me-3" alt="Member Picture">
                <div class="details">${memberDetails}</div>
                <div class="ms-auto d-flex flex-wrap gap-2">
                    <a href="https://wa.me/+966507113611" target="_blank">
                        <button class="btn btn-outline-success btn-sm btn-md-normal me-2">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </a>
                    <button class="btn btn-outline-danger btn-sm btn-md-normal delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            document.querySelector('#myTeamMembers .card-body').appendChild(newMemberCard);
            memberCard.remove();

            newMemberCard.querySelector('.delete').addEventListener('click', function() {
                if (confirm('Are you sure you want to delete?')) {
                    this.closest('.d-flex.align-items-center.mb-3').remove();
                }
            });
        });
    });

    const editProfilePicModalElement = document.getElementById('editProfilePicModal');
    const editProfilePicModal = new bootstrap.Modal(editProfilePicModalElement);
    const editProfilePicForm = document.getElementById('editProfilePicForm');
    const profilePic = document.getElementById('profilePic');
    const newProfileImageInput = document.getElementById('newProfileImage');

    document.getElementById('editProfilePicture').addEventListener('click', function() {
        editProfilePicModal.show();
    });

    editProfilePicForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!editProfilePicForm.checkValidity()) {
            event.stopPropagation();
        } else {
            const file = newProfileImageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePic.src = e.target.result;
                    profilePic.style.width = '100px';
                    profilePic.style.height = '100px';
                };
                reader.readAsDataURL(file);
            }
            editProfilePicModal.hide();
        }
        editProfilePicForm.classList.add('was-validated');
    });
});
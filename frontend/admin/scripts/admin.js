// frontend/admin/scripts/admin.js

// Admin login functionality
if (document.getElementById('adminLoginForm')) {
    const adminLoginForm = document.getElementById('adminLoginForm');
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.getElementById('adminLoginMessage');
            if (data.message === "Admin login successful.") {
                messageDiv.style.color = 'green';
                messageDiv.textContent = data.message;
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.message;
            }
        })
        .catch(err => console.error(err));
    });
}

// Functions for admin dashboard (after login)
if (document.getElementById('allBookingsContainer')) {
    let csrfToken = '';

    // Load all bookings with delete buttons.
    function loadAllBookings() {
        fetch('/api/admin/allBookings', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            csrfToken = data.csrfToken; // Save the CSRF token for subsequent requests
            const container = document.getElementById('allBookingsContainer');
            container.innerHTML = "";
            if (data.bookings.length === 0) {
                container.textContent = "No bookings found.";
            } else {
                data.bookings.forEach(booking => {
                    const div = document.createElement('div');
                    div.className = "booking-item";
                    div.innerHTML = `
                        <p><strong>ID:</strong> ${booking.id}</p>
                        <p><strong>User:</strong> ${booking.username}</p>
                        <p><strong>Room:</strong> ${booking.room}</p>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Start Time:</strong> ${booking.startTime}</p>
                        <p><strong>End Time:</strong> ${booking.endTime}</p>
                        <p><strong>Status:</strong> ${booking.status}</p>
                        <button data-id="${booking.id}" data-action="deleteBooking">Delete Booking</button>
                    `;
                    container.appendChild(div);
                });
            }
        })
        .catch(err => console.error(err));
    }

    // Load existing users with delete buttons.
    function loadUsers() {
        fetch('/api/admin/users', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            csrfToken = data.csrfToken || csrfToken;
            const usersContainer = document.getElementById('usersContainer');
            usersContainer.innerHTML = "";
            if (data.users.length === 0) {
                usersContainer.textContent = "No users found.";
            } else {
                data.users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = "user-item";
                    div.innerHTML = `ID: ${user.id} | Username: ${user.username} <button data-id="${user.id}" data-action="deleteUser">Delete User</button>`;
                    usersContainer.appendChild(div);
                });
            }
        })
        .catch(err => console.error(err));
    }

    // Create new user form submission
    const createUserForm = document.getElementById('createUserForm');
    createUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        fetch('/api/admin/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ username: newUsername, password: newPassword })
        })
        .then(response => response.json())
        .then(data => {
            const msgDiv = document.getElementById('createUserMessage');
            msgDiv.textContent = data.message;
            msgDiv.style.color = data.message.includes("successfully") ? 'green' : 'red';
            loadUsers();
        })
        .catch(err => console.error(err));
    });

    // Delegate click events for delete buttons in both bookings and users sections.
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const action = e.target.getAttribute('data-action');
            const id = e.target.getAttribute('data-id');
            if (action === 'deleteBooking') {
                // Confirm deletion before proceeding.
                if (confirm("Are you sure you want to delete this booking?")) {
                    fetch(`/api/admin/booking/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'CSRF-Token': csrfToken
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        loadAllBookings();
                    })
                    .catch(err => console.error(err));
                }
            } else if (action === 'deleteUser') {
                if (confirm("Are you sure you want to delete this user?")) {
                    fetch(`/api/admin/user/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'CSRF-Token': csrfToken
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        loadUsers();
                    })
                    .catch(err => console.error(err));
                }
            }
        }
    });

    // Load bookings and users on page load.
    loadAllBookings();
    loadUsers();

    // Logout functionality.
    document.getElementById('logoutBtn').addEventListener('click', function() {
        fetch('/api/admin/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            window.location.href = 'login.html';
        })
        .catch(err => console.error(err));
    });
}

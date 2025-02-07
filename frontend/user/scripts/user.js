// frontend/user/scripts/user.js

// User login functionality:
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.getElementById('loginMessage');
            if (data.message === "User login successful.") {
                messageDiv.style.color = 'green';
                messageDiv.textContent = data.message;
                setTimeout(() => {
                    window.location.href = 'booking.html';
                }, 1000);
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.message;
            }
        })
        .catch(err => console.error(err));
    });
}

// Booking submission and availability checking:
if (document.getElementById('bookingForm')) {
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const room = document.getElementById('room').value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        fetch('/api/user/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room, date, startTime, endTime })
        })
        .then(response => response.json())
        .then(data => {
            const bookingMessage = document.getElementById('bookingMessage');
            bookingMessage.textContent = data.message;
            bookingMessage.style.color = (data.status === 'approved') ? 'green' : 'orange';
            loadUserBookings();
        })
        .catch(err => console.error(err));
    });

    // Check availability with the specified time frame.
    const checkAvailabilityBtn = document.getElementById('checkAvailability');
    checkAvailabilityBtn.addEventListener('click', function() {
        const room = document.getElementById('room').value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        if (!room || !date || !startTime || !endTime) {
            document.getElementById('availabilityResult').textContent = "Please select room, date, start time, and end time.";
            return;
        }
        fetch(`/api/availability?room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`)
        .then(response => response.json())
        .then(data => {
            const availabilityDiv = document.getElementById('availabilityResult');
            availabilityDiv.textContent = data.message;
        })
        .catch(err => console.error(err));
    });
}

// Load the logged-in user's bookings.
function loadUserBookings() {
    fetch('/api/user/bookings')
    .then(response => response.json())
    .then(data => {
        const bookingsDiv = document.getElementById('userBookings');
        bookingsDiv.innerHTML = "";
        if (data.bookings.length === 0) {
            bookingsDiv.textContent = "No bookings found.";
        } else {
            data.bookings.forEach(booking => {
                const div = document.createElement('div');
                div.className = "booking-item";
                div.innerHTML = `
                    <p><strong>ID:</strong> ${booking.id}</p>
                    <p><strong>Room:</strong> ${booking.room}</p>
                    <p><strong>Date:</strong> ${booking.date}</p>
                    <p><strong>Start Time:</strong> ${booking.startTime}</p>
                    <p><strong>End Time:</strong> ${booking.endTime}</p>
                    <p><strong>Status:</strong> ${booking.status}</p>
                    ${booking.status !== 'cancelled' ? `<button data-id="${booking.id}">Cancel</button>` : ''}
                `;
                bookingsDiv.appendChild(div);
            });
        }
    })
    .catch(err => console.error(err));
}

// Event listener for cancel booking buttons.
document.getElementById('userBookings')?.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        const bookingId = e.target.getAttribute('data-id');
        fetch(`/api/user/cancel/${bookingId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadUserBookings();
        })
        .catch(err => console.error(err));
    }
});

// Load bookings on page load.
if (document.getElementById('userBookings')) {
    loadUserBookings();
}

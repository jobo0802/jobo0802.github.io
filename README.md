# Booking System

A simple booking system with user and admin interfaces.

## Features
- **User Interface:**
  - Customers log in using a shared password.
  - Users can book one of three rooms by selecting a room, date, and time.
  - If a user is already whitelisted (approved in a previous booking), the booking is automatically approved.
  - New users’ bookings remain pending and require admin approval.
  - Users can also check available times (a dummy implementation returns hourly slots from 9:00–17:00, minus approved bookings).

- **Admin Interface:**
  - Admin login requires separate admin credentials.
  - The dashboard displays all pending booking requests.
  - Admins can approve or deny bookings. When approved, the user is automatically whitelisted.
  - CSRF protection is enabled for admin routes.
  - Session management ensures secure admin access.

## File Structure

# jobo0802.github.io

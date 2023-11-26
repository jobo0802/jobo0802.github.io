function onRecaptchaSuccess() {
    document.getElementById("sendButton").style.display = "block";
}

window.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("bookingForm");

    form.addEventListener("submit", function(event) {
        var captchaCompleted = grecaptcha.getResponse();

        if (!captchaCompleted) {
            event.preventDefault();
            alert("Bekreft at du ikke er en robot.");
        }
    });
});
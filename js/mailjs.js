function SendMail() {
    var params = {
        navn : document.getElementById("navn").value,
        epost : document.getElementById("epost").value,
        beskjed : document.getElementById("beskjed").value
    }
    emailjs.send("service_60bjk0g", "template_oin0o4i", params).then(function(response) {
        console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
        alert("Din beskjed er sendt!");
    })

}

// Smooth scroll for navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

// Contact form fake submit (frontend only)
function submitContactForm(e) {
  e.preventDefault();
  alert("Thank you! We will contact you soon 😊");
  e.target.reset();
}

// Redirect button logic
function goToBuilder() {
  window.location.href = "resume-form.html";
}
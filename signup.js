document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    const emailExists = users.some(user => user.email === email);
    // if (emailExists) {
    //     alert("Email already exists!");
    //     return;
    // }

    users.push({ fullName, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    document.getElementById("signupDiv").style.display = "none";
    document.getElementById("loginDiv").style.display = "block";
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        alert("Login successful!");
        document.getElementById("loginDiv").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        alert("Invalid login credentials!");
    }
});

document.getElementById("createResumeBtn").addEventListener("click", function() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("resumeFormDiv").style.display = "block";
});

document.getElementById("resumeForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const resumeData = {
        personalInfo: document.getElementById("personalInfo").value,
        education: document.getElementById("education").value,
        experience: document.getElementById("experience").value,
        skills: document.getElementById("skills").value,
    };

    let resumes = JSON.parse(localStorage.getItem("resumes")) || [];
    resumes.push(resumeData);
    localStorage.setItem("resumes", JSON.stringify(resumes));

    alert("Resume saved!");
});

document.getElementById("logoutBtn").addEventListener("click", function() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("signupDiv").style.display = "block";
    document.getElementById("loginDiv").style.display = "none";
});

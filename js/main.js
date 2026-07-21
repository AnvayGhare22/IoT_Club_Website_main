// Simple script to log page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("IoT Club Website Loaded: " + window.location.pathname);
});
// Simple fade-in effect for sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

function postBlog() {
    const title = document.getElementById('new-title').value;
    const content = document.getElementById('new-content').value;
    const key = document.getElementById('admin-key').value;

    if (title === "" || content === "") {
        alert("Please fill in the blog details first.");
        return;
    }

    // Your secret admin key
    if (key === "IOT_ADMIN_2026") {
        alert("SUCCESS: Blog verified and posted!");
        // Here you can add logic to clear the form or send data
    } else {
        alert("ACCESS DENIED: Incorrect Security Key.");
    }
}

document.querySelectorAll('.info-block').forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.8s ease-out';
    observer.observe(section);
});
document.addEventListener("DOMContentLoaded", function() {
    // The event listener
    const button = document.getElementById("Start");

    // Event listener for mouse move
    document.addEventListener("mousemove", (event) => {
    // Getting mouse coordinates
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Getting button coordinates and dimensions
    const { left, top, width, height } = button.getBoundingClientRect();
    const buttonCenterX = left + width / 2;
    const buttonCenterY = top + height / 2;

    // Calculate the difference between mouse and button center
    const diffX = (mouseX - buttonCenterX) / 3;
    const diffY = (mouseY - buttonCenterY) / 3;

   // Calculate rotation angles, reducing the actual angle for subtleness
    const maxRotation = 30; // Max degrees for rotation on both axes

    const rotateY = Math.min(maxRotation, Math.max(-maxRotation, diffX / width * maxRotation));
    const rotateX = Math.min(maxRotation, Math.max(-maxRotation, -(diffY / height * maxRotation)));

    // Using GSAP to rotate
    gsap.to(button, {
    rotationY: rotateY,
    rotationX: rotateX,
    duration: 0.3, // Smooth transition
    transformPerspective: 1000, // Adds some "depth"
    transformOrigin: "center" // Ensures the rotation is around the center
    });
    });
});

document.getElementById('Start').addEventListener('click', function() {
    window.location.href = "/register";
});
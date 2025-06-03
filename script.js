window.addEventListener('load', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    // Sidebar Controls
    const colorPicker = document.getElementById('colorPicker');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const penToolBtn = document.getElementById('penTool');
    const eraserToolBtn = document.getElementById('eraserTool');

    const imageUpload = document.getElementById('imageUpload');
    const removeImageBtn = document.getElementById('removeImageBtn');
    
    const textInput = document.getElementById('textInput');
    const addTextBtn = document.getElementById('addTextBtn');
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');

    const clearDrawingsBtn = document.getElementById('clearDrawingsBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const saveBtn = document.getElementById('saveBtn');
    const grayscaleBtn = document.getElementById('grayscaleBtn');

    // Canvas Setup
    // Set a default size. Consider making this dynamic or user-configurable.
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'pen'; // 'pen', 'eraser', 'text'
    let loadedImage = null; // To store the uploaded image object
    let drawings = []; // To store drawing paths for selective clearing (more advanced)

    // --- Helper to clear canvas and redraw image if present ---
    function clearCanvasAndRedrawImage() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (loadedImage) {
            // Calculate aspect ratio to fit image on canvas
            const hRatio = canvas.width / loadedImage.width;
            const vRatio = canvas.height / loadedImage.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShift_x = (canvas.width - loadedImage.width * ratio) / 2;
            const centerShift_y = (canvas.height - loadedImage.height * ratio) / 2;
            
            ctx.drawImage(loadedImage, 0, 0, loadedImage.width, loadedImage.height,
                          centerShift_x, centerShift_y, loadedImage.width * ratio, loadedImage.height * ratio);
        }
    }


    // --- Initial Brush Settings ---
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSizeSlider.value;
    brushSizeValue.textContent = brushSizeSlider.value;
    fontSizeValue.textContent = fontSizeSlider.value;

    // --- Drawing Functions ---
    function startDrawing(e) {
        if (currentTool === 'text') return; // Don't draw if text tool is active for mousedown
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing || currentTool === 'text') return;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);

        if (currentTool === 'pen') {
            ctx.strokeStyle = colorPicker.value;
            ctx.lineWidth = brushSizeSlider.value;
        } else if (currentTool === 'eraser') {
            // For eraser, if there's an image, we need to draw the image part
            // For simplicity now, eraser draws white. A true eraser is more complex.
            ctx.strokeStyle = '#ffffff'; // Canvas background color
            ctx.lineWidth = brushSizeSlider.value; // Eraser can have its own size
        }
        
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // --- Text Function ---
    function addTextToCanvas(e) {
        if (currentTool !== 'text' || !textInput.value.trim()) return;
        
        const text = textInput.value;
        const x = e.offsetX;
        const y = e.offsetY;

        ctx.font = `${fontSizeSlider.value}px Arial`; // You can add font family selection later
        ctx.fillStyle = colorPicker.value; // Use current color for text
        ctx.textAlign = 'left'; // Or 'center', 'right'
        ctx.textBaseline = 'middle'; // Or 'top', 'bottom'
        
        ctx.fillText(text, x, y);
        // textInput.value = ''; // Optionally clear input after adding
    }


    // --- Event Listeners for Canvas ---
    canvas.addEventListener('mousedown', (e) => {
        if (currentTool === 'text') {
            addTextToCanvas(e);
        } else {
            startDrawing(e);
        }
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);


    // --- Event Listeners for Tools ---
    colorPicker.addEventListener('change', (e) => {
        ctx.strokeStyle = e.target.value;
        // If text tool is active, maybe update a "text color" variable too
    });

    brushSizeSlider.addEventListener('input', (e) => {
        ctx.lineWidth = e.target.value;
        brushSizeValue.textContent = e.target.value;
    });
    
    fontSizeSlider.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value;
    });

    penToolBtn.addEventListener('click', () => {
        currentTool = 'pen';
        canvas.style.cursor = 'crosshair';
        penToolBtn.classList.add('active');
        eraserToolBtn.classList.remove('active');
        // Potentially deactivate text tool UI indications
    });

    eraserToolBtn.addEventListener('click', () => {
        currentTool = 'eraser';
        canvas.style.cursor = 'grab'; // Or a custom eraser cursor
        eraserToolBtn.classList.add('active');
        penToolBtn.classList.remove('active');
    });

    // Image Upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                loadedImage = new Image();
                loadedImage.onload = () => {
                    clearCanvasAndRedrawImage(); // Clears canvas and draws the new image
                };
                loadedImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null; // Reset file input
    });

    removeImageBtn.addEventListener('click', () => {
        loadedImage = null;
        clearCanvasAndRedrawImage(); // Clears canvas and redraws (nothing if no image)
    });

    // Text Tool Activation (simple for now, click on canvas to add)
    addTextBtn.addEventListener('click', () => {
        currentTool = 'text';
        canvas.style.cursor = 'text';
        // You might want to highlight the text tool button
        penToolBtn.classList.remove('active');
        eraserToolBtn.classList.remove('active');
        // Consider visual feedback for text tool active
    });


    // Canvas Actions
    clearDrawingsBtn.addEventListener('click', () => {
        // This is a simplified clear. A true "clear drawings" would require
        // storing all drawing operations and replaying them, or drawing on a
        // separate layer. For now, it clears everything but the base image.
        clearCanvasAndRedrawImage();
    });
    
    clearAllBtn.addEventListener('click', () => {
        loadedImage = null; // Also remove the reference to the loaded image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'drawing-pad-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        link.remove();
    });

    // Filter
    grayscaleBtn.addEventListener('click', () => {
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i]     = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        ctx.putImageData(imageData, 0, 0);
    });

    // --- Initial active tool ---
    penToolBtn.classList.add('active');
    canvas.style.cursor = 'crosshair';

});
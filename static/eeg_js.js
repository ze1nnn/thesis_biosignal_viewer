console.log("JavaScript file loaded and executed.");

var plotDiv = document.getElementById('eeg-plot');

var xValues = []; // Array to store x-coordinates

var annotations = [];

var click;

function handlePlotClick(event) {
    // Get the clicked point's x-coordinate
    var clickedX = event.points[0].x;

    // Check if xValues array has one value
    if (xValues.length === 1) {
        // Calculate the difference between the current and previous x-coordinates
        var timeDifference = clickedX - xValues[0];

        // Show the time difference in an alert
        alert('Time Difference: ' + timeDifference);

        // Clear the xValues array for the next set of clicks
        xValues = [];
    } else {
        // First click, add the x-coordinate to the array
        xValues.push(clickedX);
    }
}

var myPlot = document.getElementById('myDiv');
var x = jsonData.x;
var y = jsonData.y;
var data = [
    {
        x: x,
        y: y,
        //mode: 'lines',
        name: 'EEG Data',
        line: {color: 'rgba(33, 97, 140)'}
    }
];


var layout = {
    title :'Biosignals', 
    xaxis: {
        title: 'Time (s)'
    },
     yaxis: {
        title: 'Biosignal Data (V)',
        tickformat: ',.5f' // Format y-axis ticks with 2 decimal places
    },
    hovermode: 'x unified',
    //width: '100%',  // Set graph width to 100%
    plot_bgcolor: 'rgba(214, 234, 248,0.5)', 
    paper_bgcolor: 'rgba(133, 193, 233)',  
    gridcolor: 'rgba(254,254,254)'  
};

Plotly.newPlot('myDiv', data, layout);

myPlot.on('plotly_click', handlePlotClick);


// Annotation work starts 

//////////Add a click event listener to the "Start Annotation" button////////
document.addEventListener('DOMContentLoaded', function () {
    // Initialize annotation mode status
    var annotationModeActive = false;
    click = 0
    // Add event listener to the button
    document.getElementById('start-annotation-btn').addEventListener('click', function () {
        // Toggle annotation mode
        
        annotationModeActive = !annotationModeActive;

        // Call the annotation mode function
        startAnnotationMode();
        updateAnnotationMode();
    });

    // Function to start annotation mode
    function startAnnotationMode() {
        if (annotationModeActive) {
            // Add a click event listener to the plotDiv during annotation mode
            myPlot.on('plotly_click', function (event) {
                // Handle the click event during annotation mode
                handleAnnotationClick(event);
            });

            // Optionally, you can provide some visual indication that annotation mode is active
            // For example, change the cursor style, highlight the button, or add a message to the user
            alert('Annotation mode activated. Click on the graph to add notes.');
        }else {
            // Remove the click event listener when annotation mode is deactivated
            myPlot.removeListener('plotly_click', handleAnnotationClick);
        }
    }

    // Function to handle click events during annotation
    function handleAnnotationClick(event) {
         if (!annotationModeActive) {
            return;
        }
        // Identify the clicked point
        var clickedPointIndex = event.points[0].pointIndex;

        // Change the color of the clicked point (you may need to update based on your data structure)
        addArrowAnnotation(clickedPointIndex);

        // Prompt the user to enter notes for the clicked point
        var userNotes = prompt('Enter notes for the selected point:');
        

        // Display the entered notes on the right bottom of the web page
        displayNotes(userNotes,clickedPointIndex);
        
        // Disable annotation mode after adding notes
        annotationModeActive = false;
        updateAnnotationMode();
    }

    // Function to update the color of the clicked point
        function addArrowAnnotation(pointIndex) {
        // Get the x and y coordinates of the clicked point
        var xCoordinate = myPlot.data[0].x[pointIndex];
        var yCoordinate = myPlot.data[0].y[pointIndex];
        click = click + 1;
        // Define arrow properties
        var arrowProperties = {
            x: xCoordinate,
            y: yCoordinate,
            arrowhead: 4,
            arrowsize: 2,
            arrowwidth: 2,
            arrowcolor: 'red',
            text: 'Point ' + click,
            font: {
                size: 12,
                color: 'red'
            },
            ax: 0,
            ay: -40,
            xref: 'x',
            yref: 'y',
        };
        // Add the arrow annotation to the array
        annotations.push(arrowProperties);

        // Update the layout with the existing and new annotations
        Plotly.relayout('myDiv', { annotations: annotations });
    }
    // Function to display notes on the right bottom
    function displayNotes(notes, clickedPointIndex) {
        // Get the x and y coordinates of the clicked point
        var xCoordinate = x[clickedPointIndex];
        var yCoordinate = y[clickedPointIndex];
    
        // Create a new div element for displaying notes
        var notesDiv = document.createElement('div');
        notesDiv.textContent = 'Point '+ click +': x =' + xCoordinate + ', y=' + yCoordinate + ', ' + notes;
        notesDiv.style.color = 'red';
        // Append the notes div to the body or any desired container
        document.body.appendChild(notesDiv);
    }

    function updateAnnotationMode() {
        // Example: Update button text based on annotation mode status
        var button = document.getElementById('start-annotation-btn');
        button.innerText = annotationModeActive ? 'Disable Annotation Mode' : 'Enable Annotation Mode';

        // Add any other logic you need for enabling or disabling annotation mode
    }



////////Paint//////////////////////////////
// Assuming myPlot is your Plotly chart

var isDrawing = false;
var startX, startY, currentShape;

// Function to start drawing mode
function startDrawingMode() {
    // Add a click event listener to the plotDiv during drawing mode
    myPlot.on('plotly_click', handleDrawingClick);

    // Optionally, you can provide some visual indication that drawing mode is active
    alert('Drawing mode activated. Click and drag on the graph to draw.');
}

// Function to handle click events during drawing
function handleDrawingClick(event) {
    if (!isDrawing) {
        // Start drawing
        isDrawing = true;
        startX = event.points[0].x;
        startY = event.points[0].y;
    } else {
        // End drawing
        isDrawing = false;

        // Draw the shape
        var endX = event.points[0].x;
        var endY = event.points[0].y;

        var shape = {
            type: 'rect',
            x0: startX,
            y0: startY,
            x1: endX,
            y1: endY,
            fillcolor: 'red',
            opacity: 0.3,
            line: {
                color: 'red',
                width: 2
            }
        };

        // Add the shape to the layout.shapes array
        
        Plotly.relayout('myDiv', { shapes: [shape] });

        // Remove the click event listener
        myPlot.removeListener('plotly_click', handleDrawingClick);

        // Optionally, you can provide some visual indication that drawing mode is disabled
        alert('Drawing mode disabled.');
    }
}

// Add a click event listener to the "Start Drawing" button
document.getElementById('start-drawing-btn').addEventListener('click', startDrawingMode);


});
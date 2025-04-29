// Complete task using the API
function completeTask(taskId) {
    fetch(`/api/todos/${taskId}/complete`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // Find the task element and mark it as completed
            const taskElement = document.querySelector(`.list-group-item[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('completed');
                
                // Update the complete button
                const completeBtn = taskElement.querySelector('.btn-success');
                if (completeBtn) {
                    completeBtn.remove();
                }
                
                // Update task statistics
                updateTaskStats();
            }
        }
    })
    .catch(error => {
        console.error('Error completing task:', error);
        alert('Failed to complete task. Please try again.');
    });
}

// Delete task using the API
function deleteTask(taskId) {
    fetch(`/api/todos/${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // Find the task element and remove it with animation
            const taskElement = document.querySelector(`.list-group-item[data-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('animate__animated', 'animate__fadeOutRight');
                
                // Remove the element after animation completes
                setTimeout(() => {
                    taskElement.remove();
                    
                    // Update task statistics
                    updateTaskStats();
                }, 500);
            }
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
    });
}

// Update task statistics
function updateTaskStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(stats => {
            // Update counters
            document.getElementById('total-tasks').textContent = stats.total;
            document.getElementById('completed-tasks').textContent = stats.completed;
            document.getElementById('pending-tasks').textContent = stats.pending;
            
            // Update progress bar
            const progressBar = document.getElementById('task-progress');
            progressBar.style.width = `${stats.completion_percentage}%`;
            progressBar.textContent = `${stats.completion_percentage}%`;
            progressBar.setAttribute('aria-valuenow', stats.completion_percentage);
            
            // Update chart
            initTaskChart();
        })
        .catch(error => {
            console.error('Error updating stats:', error);
        });
}

// Filter tasks by status or priority using the API
function filterTasks(filter) {
    let url = '/api/todos/filter?';
    
    if (filter === 'completed' || filter === 'pending') {
        url += `status=${filter}`;
    } else if (filter === 'high' || filter === 'medium' || filter === 'low') {
        url += `priority=${filter}`;
    } else {
        url += 'status=all';
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateTaskList(data);
        })
        .catch(error => {
            console.error('Error fetching filtered tasks:', error);
        });
}

// Apply date filter using the API
function applyDateFilter() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both from and to dates');
        return;
    }
    
    const url = `/api/todos/filter?from_date=${fromDate}&to_date=${toDate}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateTaskList(data);
        })
        .catch(error => {
            console.error('Error fetching date-filtered tasks:', error);
        });
}

// Update the task list with filtered data
function updateTaskList(tasks) {
    const listGroup = document.querySelector('.list-group');
    listGroup.innerHTML = '';
    
    if (tasks.length === 0) {
        listGroup.innerHTML = '<p class="text-center">No tasks match your filter criteria</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `list-group-item priority-${task.priority} task-added`;
        taskElement.setAttribute('data-id', task.id);
        
        if (task.status === 'completed') {
            taskElement.classList.add('completed');
        }
        
        const tagsHtml = task.tags.map(tag => 
            `<span class="task-tag">${tag}</span>`
        ).join('');
        
        taskElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">
                    <i class="fas fa-clipboard-check task-icon"></i>
                    ${task.title}
                </h5>
                <small>
                    <i class="far fa-clock task-icon"></i>
                    ${task.due_date || 'No due date'}
                </small>
            </div>
            <p class="mb-1">
                <i class="fas fa-align-left task-icon"></i>
                ${task.description || 'No description'}
            </p>
            <div class="mb-2">
                ${tagsHtml}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <small>
                    <i class="fas fa-flag task-icon"></i>
                    Priority: ${task.priority}
                </small>
                <div class="btn-group">
                    ${task.status !== 'completed' ? 
                        `<button class="btn btn-success btn-sm" onclick="completeTask(${task.id})">
                            <i class="fas fa-check-circle me-1"></i> Complete
                        </button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                        <i class="fas fa-trash-alt me-1"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        listGroup.appendChild(taskElement);
    });
    
    // Add event listeners to the newly created buttons
    addButtonEventListeners();
}

// Add event listeners to buttons
function addButtonEventListeners() {
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-danger').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.hasAttribute('data-listener')) {
                e.preventDefault();
                const taskElement = this.closest('.list-group-item');
                if (taskElement) {
                    // Animate the removal
                    taskElement.classList.add('animate__animated', 'animate__fadeOutRight');
                    
                    // Remove the element after animation completes
                    setTimeout(() => {
                        taskElement.remove();
                        
                        // Update task statistics
                        updateTaskStats();
                    }, 500);
                }
                this.setAttribute('data-listener', 'true');
            }
        });
    });
    
    // Add event listeners to complete buttons
    document.querySelectorAll('.btn-success').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.hasAttribute('data-listener')) {
                e.preventDefault();
                const taskElement = this.closest('.list-group-item');
                if (taskElement) {
                    // Toggle completed class
                    taskElement.classList.toggle('completed');
                    
                    // Update task statistics
                    updateTaskStats();
                }
                this.setAttribute('data-listener', 'true');
            }
        });
    });
}

// Export tasks function
function exportTasks(format) {
    window.location.href = `/api/todos/export?format=${format}`;
}

// Print tasks
function printTasks() {
    window.print();
}

// Download file helper
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize particles and event listeners when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if(typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize chart
    initTaskChart();
    
    // Add event listeners to buttons
    addButtonEventListeners();
    
    // Add search functionality
    document.getElementById('task-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const tasks = document.querySelectorAll('.list-group-item');
        
        tasks.forEach(task => {
            const title = task.querySelector('h5').textContent.toLowerCase();
            const description = task.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    });
});
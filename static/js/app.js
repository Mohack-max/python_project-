document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeTaskDragDrop();
    initializeSearchAndFilters();
    initializeTaskActions();
    initializeCharts();
    initializeAnimations();
});

// Task Drag and Drop
function initializeTaskDragDrop() {
    const taskList = document.querySelector('#taskGrid');
    if (taskList) {
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'task-ghost',
            dragClass: 'task-drag',
            onEnd: async function(evt) {
                try {
                    await fetch('/update_task_order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            oldIndex: evt.oldIndex,
                            newIndex: evt.newIndex
                        })
                    });
                } catch (error) {
                    console.error('Error updating task order:', error);
                }
            }
        });
    }
}

// Search and Filters
function initializeSearchAndFilters() {
    const searchInput = document.querySelector('#taskSearch');
    const categoryFilter = document.querySelector('#categoryFilter');
    const sortFilter = document.querySelector('#sortFilter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterTasks, 300));
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTasks);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', sortTasks);
    }
}

function filterTasks() {
    const searchQuery = document.querySelector('#taskSearch').value.toLowerCase();
    const categoryValue = document.querySelector('#categoryFilter').value;
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const title = task.querySelector('.card-title').textContent.toLowerCase();
        const category = task.dataset.category;
        const matchesSearch = title.includes(searchQuery);
        const matchesCategory = !categoryValue || category === categoryValue;
        task.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

function sortTasks() {
    const sortValue = document.querySelector('#sortFilter').value;
    const taskGrid = document.querySelector('#taskGrid');
    const tasks = Array.from(taskGrid.children);

    tasks.sort((a, b) => {
        switch(sortValue) {
            case 'priority':
                return getPriorityWeight(b) - getPriorityWeight(a);
            case 'due-date':
                return new Date(a.dataset.dueDate) - new Date(b.dataset.dueDate);
            case 'date-asc':
                return new Date(a.dataset.createDate) - new Date(b.dataset.createDate);
            default:
                return new Date(b.dataset.createDate) - new Date(a.dataset.createDate);
        }
    });

    tasks.forEach(task => taskGrid.appendChild(task));
}

// Task Actions
function initializeTaskActions() {
    document.querySelectorAll('.task-action').forEach(button => {
        button.addEventListener('click', handleTaskAction);
    });

    // Initialize subtask functionality
    document.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleSubtaskUpdate);
    });
}

async function handleTaskAction(event) {
    const action = event.currentTarget.dataset.action;
    const taskId = event.currentTarget.closest('.task-item').dataset.id;

    try {
        const response = await fetch(`/task/${action}/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Action failed');
        
        // Update UI based on action
        updateTaskUI(action, taskId);
    } catch (error) {
        console.error('Error:', error);
        showNotification('error', 'Failed to update task');
    }
}

// Charts and Analytics
function initializeCharts() {
    const ctx = document.getElementById('taskProgressChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [
                        parseInt(ctx.dataset.completed),
                        parseInt(ctx.dataset.inProgress),
                        parseInt(ctx.dataset.pending)
                    ],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showNotification(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Animation Effects
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.task-item').forEach(item => {
        observer.observe(item);
    });
}
// import MiniFramework from '../framework/core.js';
import MiniFramework from '../framework/index.js';

// Setup theme management
const setupTheme = () => {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
  
  // Toggle theme
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Update button icon
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
};

// Clear all data


const setupClearStorage = () => {
  const clearStorageBtn = document.getElementById('clear-storage');
  clearStorageBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to clear all todo data?')) {
      localStorage.removeItem('todos');
      localStorage.removeItem('categories');
      localStorage.removeItem('currentCategory');
      window.location.reload();
    }
  });
};

// Valid filter values
const validFilters = ['all', 'active', 'completed'];
let initialFilter = window.location.hash.replace(/^#\/?/, '');
if (!validFilters.includes(initialFilter)) initialFilter = 'all';

// Create global application state
const appState = MiniFramework.createState({
  todos: JSON.parse(localStorage.getItem('todos') || '[]'),
  filter: initialFilter,
  categories: JSON.parse(localStorage.getItem('categories') || '["Personal", "Work", "Shopping"]'),
  currentCategory: localStorage.getItem('currentCategory') || 'all'
});

// Save todos to localStorage when state changes
appState.subscribe((state) => {
  localStorage.setItem('todos', JSON.stringify(state.todos));
});

// Save categories to localStorage when they change
appState.subscribe((state) => {
  localStorage.setItem('categories', JSON.stringify(state.categories));
  localStorage.setItem('currentCategory', state.currentCategory);
});

// Log filter state changes
appState.subscribe((state) => {
  console.log('Filter changed:', state.filter);
});

// // Re-render when state changes
// appState.subscribe(() => {
//     MiniFramework.mount(App(), '#app-root');
// });

// Create a single subscription before defining App component
const renderApp = () => {
    MiniFramework.mount(App(), '#app-root');
  };
  
// Set up subscription only once
appState.subscribe(renderApp);

// Create router
const router = MiniFramework.createRouter({
  defaultRoute: '/all',
  notFoundHandler: (path) => {
    console.log(`Route not found: ${path}, redirecting to default`);
    window.location.hash = '#/all';
  }
});

// Add routes
router.add('/all', () => appState.setState({ filter: 'all' }));
router.add('/active', () => appState.setState({ filter: 'active' }));
router.add('/completed', () => appState.setState({ filter: 'completed' }));

// Initialize router
router.init();

// Log initial route state
console.log('Initial router state:', router.getCurrentRoute());

// Re-run route handler on hash change
window.addEventListener('hashchange', () => {
  // The router already handles this event in its init() method
});

// TodoInput component
const TodoInput = MiniFramework.createComponent(() => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const text = input.value.trim();
    
    if (text) {
      const todos = appState.getState('todos');
      appState.setState({
        todos: [...todos, {
          id: Date.now(),
          text,
          completed: false
        }]
      });
      input.value = '';
    }
  };
  
  return MiniFramework.createElement('form', { 
    class: 'todo-form',
    onsubmit: handleSubmit
  }, 
    MiniFramework.createElement('input', {
      class: 'new-todo',
      placeholder: 'What needs to be done?',
      autofocus: true,
      'aria-label': 'New todo input'
    })
  );
});

// TodoItem component
const TodoItem = MiniFramework.createComponent((props) => {
  const { todo } = props;
  
  const toggleTodo = () => {
    const todos = appState.getState('todos');
    const updatedTodos = todos.map(t => 
      t.id === todo.id ? { ...t, completed: !t.completed } : t
    );
    
    appState.setState({
      todos: updatedTodos
    });
  };
  
  const deleteTodo = () => {
    const todos = appState.getState('todos');
    appState.setState({
      todos: todos.filter(t => t.id !== todo.id)
    });
  };
  
  const editTodo = (e) => {
    const newText = e.target.value.trim();
    if (newText) {
      const todos = appState.getState('todos');
      appState.setState({
        todos: todos.map(t => 
          t.id === todo.id ? { ...t, text: newText } : t
        )
      });
    }
  };
  
  const handleKeyDown = (e) => {
    // Delete todo with Delete key when focused on toggle
    if (e.key === 'Delete') {
      deleteTodo();
    }
  };
  
  return MiniFramework.createElement('li', {
    class: todo.completed ? 'completed' : '',
    'data-id': todo.id,
    role: 'listitem'
  },
    MiniFramework.createElement('div', { class: 'view' },
      MiniFramework.createElement('input', {
        class: 'toggle',
        type: 'checkbox',
        checked: todo.completed,
        onclick: toggleTodo,
        onkeydown: handleKeyDown,
        'aria-label': todo.completed ? 'Mark as incomplete' : 'Mark as complete'
      }),
      MiniFramework.createElement('label', {
        ondblclick: (e) => {
          e.target.parentElement.parentElement.classList.add('editing');
          const editInput = e.target.parentElement.nextElementSibling;
          editInput.focus();
          editInput.setSelectionRange(0, editInput.value.length);
        }
      }, todo.text),
      MiniFramework.createElement('button', {
        class: 'destroy',
        onclick: deleteTodo,
        'aria-label': 'Delete todo'
      })
    ),
    MiniFramework.createElement('input', {
      class: 'edit',
      value: todo.text,
      onblur: (e) => {
        editTodo(e);
        e.target.parentElement.classList.remove('editing');
      },
      onkeyup: (e) => {
        if (e.key === 'Enter') {
          editTodo(e);
          e.target.parentElement.classList.remove('editing');
        }
        if (e.key === 'Escape') {
          e.target.value = todo.text;
          e.target.parentElement.classList.remove('editing');
        }
      },
      'aria-label': 'Edit todo'
    })
  );
});

// TodoList component
const TodoList = MiniFramework.createComponent(() => {
  const state = appState.getState();
  const { todos, filter } = state;
  
  // Filter todos based on current filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // Empty state message
  if (filteredTodos.length === 0) {
    return MiniFramework.createElement('div', { 
      class: 'empty-state',
      role: 'status',
      'aria-live': 'polite'
    },
      filter === 'all' ? 
        'Add your first todo using the input above.' :
        filter === 'active' ? 
          'No active todos. All tasks completed!' :
          'No completed todos yet.'
    );
  }
  
  return MiniFramework.createElement('ul', { 
    class: 'todo-list',
    role: 'list'
  },
    filteredTodos.map(todo => TodoItem({ todo }))
  );
});

// TodoFooter component
const TodoFooter = MiniFramework.createComponent(() => {
  const state = appState.getState();
  const { todos, filter } = state;
  
  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  // Don't show footer if no todos
  if (todos.length === 0) {
    return null;
  }
  
  const clearCompleted = () => {
    appState.setState({
      todos: todos.filter(todo => !todo.completed)
    });
  };
  
  return MiniFramework.createElement('footer', { class: 'footer' },
    MiniFramework.createElement('span', { class: 'todo-count', 'aria-live': 'polite' },
      MiniFramework.createElement('strong', {}, activeTodos.length),
      ` item${activeTodos.length !== 1 ? 's' : ''} left`
    ),
    MiniFramework.createElement('ul', { class: 'filters', role: 'tablist' },
      MiniFramework.createElement('li', { role: 'presentation' },
        MiniFramework.createElement('a', { 
          href: '#/all',
          class: filter === 'all' ? 'selected' : '',
          role: 'tab',
          'aria-selected': filter === 'all' ? 'true' : 'false'
        }, 'All')
      ),
      MiniFramework.createElement('li', { role: 'presentation' },
        MiniFramework.createElement('a', {
          href: '#/active',
          class: filter === 'active' ? 'selected' : '',
          role: 'tab',
          'aria-selected': filter === 'active' ? 'true' : 'false'
        }, 'Active')
      ),
      MiniFramework.createElement('li', { role: 'presentation' },
        MiniFramework.createElement('a', {
          href: '#/completed',
          class: filter === 'completed' ? 'selected' : '',
          role: 'tab',
          'aria-selected': filter === 'completed' ? 'true' : 'false'
        }, 'Completed')
      )
    ),
    completedTodos.length > 0 ?
      MiniFramework.createElement('button', {
        class: 'clear-completed',
        onclick: clearCompleted,
        'aria-label': 'Clear completed todos'
      }, 'Clear completed') : null
  );
});

// Main App component
const App = MiniFramework.createComponent(() => {
  const state = appState.getState();
//------------------

  
  
  return MiniFramework.createElement('div', { class: 'todoapp-container' },
    TodoInput(),
    MiniFramework.createElement('section', { 
      class: 'main',
      'aria-label': 'Todo list'
    },
      state.todos.length > 0 ? 
        MiniFramework.createElement('input', {
          id: 'toggle-all',
          class: 'toggle-all',
          type: 'checkbox',
          checked: state.todos.every(todo => todo.completed),
          'aria-label': 'Mark all as complete',
          onclick: () => {
            const allCompleted = state.todos.every(todo => todo.completed);
            appState.setState({
              todos: state.todos.map(todo => ({
                ...todo,
                completed: !allCompleted
              }))
            });
          }
        }) : null,
      state.todos.length > 0 ?
        MiniFramework.createElement('label', { 
          for: 'toggle-all',
          'aria-hidden': 'true'
        }, 'Mark all as complete') : null,
      TodoList()
    ),
    TodoFooter()
  );
});

// // Mount app when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   MiniFramework.mount(App(), '#app-root');
// });

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  setupTheme();
  setupClearStorage();
});
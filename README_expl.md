+++++++++++

# Mini-Framework Documentation

Mini-Framework is a lightweight JavaScript framework that provides essential features for modern web applications. It implements DOM abstraction, routing, state management, and event handling in a simple and intuitive API.

## Features

- **Virtual DOM**: Create and manipulate DOM elements with a declarative API
- **State Management**: Manage application state with a simple pub/sub pattern
- **Routing System**: Handle URL changes and navigation
- **Event Handling**: Custom event system for components communication
- **Component-Based Architecture**: Build reusable components

## Getting Started

To use Mini-Framework, import it in your JavaScript file:

```javascript
import MiniFramework from '../framework/core.js';

=======================================================================================

Creating Elements
The framework provides a createElement method to create virtual DOM elements:

// Creating a simple button
const button = MiniFramework.createElement('button', 
  { 
    class: 'my-button',
    onclick: () => alert('Button clicked!')
  }, 
  'Click me'
);

// Creating a div with nested elements
const container = MiniFramework.createElement('div',
  { class: 'container' },
  MiniFramework.createElement('h1', {}, 'Hello World'),
  MiniFramework.createElement('p', {}, 'This is a paragraph')
);

=======================================================================================

Adding Attributes
Attributes are passed as the second argument to the createElement method:

const input = MiniFramework.createElement('input', {
  type: 'text',
  placeholder: 'Enter your name',
  class: 'input-field',
  id: 'name-input',
  required: true,
  'data-custom': 'value' // Custom data attributes
});

=======================================================================================

Event Handling
There are two ways to handle events in Mini-Framework:

1. DOM Event Handlers
You can add DOM event handlers directly as attributes:

const button = MiniFramework.createElement('button', {
  onclick: (e) => console.log('Button clicked!', e),
  onmouseover: () => console.log('Mouse over!')
}, 'Click me');

=======================================================================================

2. Custom Event System
The framework also provides a custom event system:

// Subscribe to an event
const unsubscribe = MiniFramework.events.on('user-login', (userData) => {
  console.log('User logged in:', userData);
});

// Emit an event
MiniFramework.events.emit('user-login', { id: 1, name: 'John' });

// Unsubscribe when no longer needed
unsubscribe();

=======================================================================================

Nesting Elements
Elements can be nested by passing them as children (third and subsequent arguments):

const list = MiniFramework.createElement('ul', { class: 'list' },
  MiniFramework.createElement('li', {}, 'Item 1'),
  MiniFramework.createElement('li', {}, 'Item 2'),
  MiniFramework.createElement('li', {}, 
    MiniFramework.createElement('strong', {}, 'Item 3')
  )
);

=======================================================================================

State Management
Mini-Framework provides a simple state management system:

// Create a state container
const state = MiniFramework.createState({
  count: 0,
  user: { name: 'Guest' }
});

// Get state
const currentCount = state.getState('count'); // Get specific property
const fullState = state.getState(); // Get entire state

// Update state
state.setState({ count: currentCount + 1 });

// Subscribe to state changes
const unsubscribe = state.subscribe((newState, oldState) => {
  console.log('State changed', oldState, newState);
  renderApp(); // Re-render your application
});

// Unsubscribe when component unmounts
unsubscribe();

=======================================================================================

Routing
The framework includes a simple hash-based routing system:

// Define routes
const router = MiniFramework.createRouter({
  '/': () => renderHomePage(),
  '/about': () => renderAboutPage(),
  '/users/:id': (params) => renderUserProfile(params.id)
});

// Initialize router
router.init();

// Navigate programmatically
const goToAbout = () => router.navigate('/about');

// Get current route
const currentRoute = router.getCurrentRoute();

// Listen for route changes
router.onRouteChange((newRoute) => {
  console.log('Route changed to', newRoute);
});

=======================================================================================

Components
Create reusable components:

// Define a component
const Button = MiniFramework.createComponent((props) => {
  const { text, onClick, className } = props;
  
  return MiniFramework.createElement('button', {
    class: className || 'default-button',
    onclick: onClick
  }, text);
});

// Use the component
const myButton = Button({
  text: 'Click me',
  onClick: () => alert('Button clicked!'),
  className: 'primary-button'
});

=======================================================================================

Rendering
To render your application to the DOM:

// Define your app component
const App = MiniFramework.createComponent(() => {
  return MiniFramework.createElement('div', { class: 'app' },
    MiniFramework.createElement('h1', {}, 'Hello World')
  );
});

// Mount the app to a DOM element
const app = MiniFramework.mount(App(), '#app-root');

// Update the app
app.update(App());

=======================================================================================

How It Works
Mini-Framework operates on a few key principles:

Virtual DOM: Elements are created as JavaScript objects first, which are then rendered to the real DOM.

Unidirectional Data Flow: State changes trigger re-renders, creating a predictable data flow.

Component-Based: The application is built with reusable components.

Event-Driven: Components communicate through events and state changes.

This approach simplifies development and helps create more maintainable code by separating concerns and providing a consistent structure.

=======================================================================================
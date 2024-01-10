'use strict';

import { _useStorage } from '../useLocalStorage.js';

const form = document.querySelector('#loginForm');
const userNameInput = form.querySelector('#userNameInput');
const passwordInput = form.querySelector('#passwordInput');

const storage = _useStorage({ encrypt: true });

let stateKey = 'userLoginData';

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let userName = userNameInput.value;
  let password = passwordInput.value;

  // set data in storage
  storage.setState(stateKey, { userName, password });
});

// retrive user data on page load
window.onload = () => {
  let user = storage.getState(stateKey);

  if (user) {
    console.log('Hello, Welcome:', user.userName);
    userNameInput.value = user.userName;
    passwordInput.value = user.password;
  }
};

// react to storage changes
storage.onChange(() => {
  let user = storage.getState(stateKey);
  console.log('Local data has changed:', user);

  // if user logged out, auto redirect them to login page
  if (!user) {
    window.location = '/login.html';
  }
});

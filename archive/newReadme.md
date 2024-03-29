# _useLocalStorage v2

## Usage

Import and instantiate the local storage utility as storage with optional options. Which can be storageType or encryption while storageType can be `local` or `session` and encryption can be `true` or `false` and for both local and true are enabled by default respectively.

For Example:

```javascript

import { _useStorage } from 'useLocalStorage.v2.js';

// Use Local Storage & Enable encryption (both enabled by default)
const storage = _useStorage();

// use session storage istead and maybe also disable encryption
const storage = _useStorage({storageType: "session", encrypt: false});

// Disable encryption only
// const storage = _useStorage({ encrypt: false });
```

### Set Data in Storage

``` javascript

const key = 'super-secret';
const dataToStore = { username: 'kizz', id: 123 };

// Set data with caching options
storage.setState(key, dataToStore, {
  cacheTimeout: true, // false disables the cache
  cacheTime: 1000, // 60,000 milliseconds default
});

// just set data without any options
// storage.setState(key, dataToStore);

```

### Retrieve Data from Storage

``` javascript

const retrievedData = storage.getState('super-secret');
console.log('Retrieved data:', retrievedData);

```

### Reset/Clear Storage

This will clear all local storage or storages, removing any previously set data, even if set through other ways other than _useLocalStorage!

So use intentionally, To reset or clear the local storage:

``` javascript
storage.resetStorage();
```

### Listen To Storage Change Events

You can listen to storage change events using the onChange method and run any side effects or callbacks you would want to run whenever local state changes, say redirect a user to login when they logout etc.

``` javascript

storage.onChange((event) => {
  console.log('Storage changed:', event);
  // do something about the change... if you want to!
});

```

### Here is an example of how most of those concepts come together

This is snippet from example directory, you can check it out for the html part, but as far as js is concerned, here we go:

``` js

'use strict';

import { _useStorage } from '../main.js';

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

```

That's it, some few things to note though, just a few...

### Notes For Nerds

- useLocalStorage storage unlike the normal broswer `localStorage` doesnot overwrite state unnecessarily, that is if the state already exists with the same state key, it just updates it instead, otherwise sets it to the new value.
- The underscore on hook name `_useLocalStorage` was intentional to prevent hook rules in if say this is used in a react applications, and because we don't obey those rules, this hook does not need to be used in a useEffect to work unlike the normal local storage, this just works, in react or vanilla.
- The encryption used to secure the data as it is stored in broswer is basic and your advised to use more secure means if you deal with really really sensitive data, it shouldn't be in local storage even in first place or so, consider a cloud database maybe, none the less, each state key is used to encrypt and decrypt the data, so if you loose it, that data might be unrecoverable but if everything is used as indicated, this process is all automatically handled by the lib itself you don't have to lift a finger!


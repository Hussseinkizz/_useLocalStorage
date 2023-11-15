import { useState } from 'react';
import { _useLocalStore } from './hooks/useLocalStorage.js';

const App = () => {
  // get stuff from hook, hook name starts with underscore to avoid some react rules on how we can use it, after all it's plain js implementation why limit us with react hook rules, no useEffect this way!
  const { getLocalStore, setLocalStore, resetLocalStore } =
    _useLocalStore('session');

  // get local state and load it initially as initial form values
  const userData = async () => getLocalStore('$userData');

  const [username, setUsername] = useState(userData?.username ?? '');
  const [password, setPassword] = useState(userData?.password ?? '');

  const handleForm = () => {
    let userData = {
      username,
      password,
    };

    // cache the user's form data,
    resetLocalStore(); // reset local store clean for initial storing not need after wards and is optional either way!

    // cache data as whole, and make it cached forever by setting cacheTimeout  to false
    const localStateAll = async () =>
      setLocalStore('$userData', userData, {
        cacheTimeout: false,
      });

    if (localStateAll) {
      console.log('All User Data:', localStateAll);
    }

    // cache data per state basis, by default cache auto resets after sometime
    const localStateUsername = async () =>
      setLocalStore('$username', username, {});

    if (localStateUsername) {
      console.log('Just Username:', localStateUsername);
    }

    // try getting the data anywhere else, in any way you want!
    getData();
  };

  // again you can access that data anytime unless it was auto reset
  const getData = async () => {
    const userData = await getLocalStore('$userData');
    console.log("Any data can be retreived later via it's key", userData);
  };

  return (
    <main className="main-container">
      <h1 className="font-bold text-lg">Welcome Back To Coffee & Popcorn🍦</h1>
      <form onSubmit={(e) => e.preventDefault()} className="flex-col-flow">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          className="input-styles"
          placeholder="username"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          className="input-styles"
          placeholder="password"
        />
        <button type="submit" className="button-styles" onClick={handleForm}>
          Login
        </button>
      </form>
    </main>
  );
};

export default App;

export const _useLocalStore = (storageType = 'local') => {
  // select appropriate storage type as user defined
  let storage = storageType === 'session' ? sessionStorage : localStorage;

  // define a key to uniquely identify react-x-hands storage stuff
  let storageKey = 'default-key';
  // let storageKey = Symbol();
  // console.log(storageKey());

  // handle auto reseting of storage
  const timeBomb = (key, cacheTime) => {
    if (typeof window) {
      setTimeout(() => {
        // storage.clear();
        set(key, '');
      }, cacheTime);
    }
  };

  // prepare the state to persist
  let stateToPersist = [];

  // updated whenever this function is called
  let persistedState = {};

  // if clear is passed first clear all existing state
  const resetLocalStore = () => {
    if (typeof window) {
      storage.clear();
    }
  };

  // define some little utilities
  let set = (key, stateToPersist) => {
    try {
      storage.setItem(key, JSON.stringify(stateToPersist));
    } catch (error) {
      throw new Error(`Error setting state ${key}: ${error}`);
    }
  };
  let get = (key) => {
    try {
      let state = JSON.parse(storage.getItem(key));
      if (state) {
        return state;
      } else {
        // console.error(`Local state ${key} not found!`);
        return null;
      }
    } catch (error) {
      throw new Error(`Error retrieving state ${key}: ${error}`);
    }
  };

  const setLocalStore = (
    key,
    currentState,
    { cacheTimeout = true, cacheTime = 60 * 1000 }
  ) => {
    if (typeof window) {
      // we on client, do stuff
      try {
        stateToPersist = currentState;
        let stateKey = key ?? storageKey;

        // enable time bomb
        // console.log('timeout:', stateKey, cacheTimeout, cacheTime);
        if (cacheTimeout === true) {
          timeBomb(stateKey, cacheTime);
        }

        if (get(stateKey)) {
          // check if state exists, if true update else create new state
          let oldLocalState = get(stateKey);
          let newLocalState = { ...oldLocalState, ...stateToPersist };
          set(stateKey, newLocalState);
          persistedState = get(stateKey);
          return persistedState;
        } else {
          // create new
          set(stateKey, stateToPersist);
          persistedState = get(stateKey);
          return persistedState;
        }
      } catch (error) {
        console.error(`Error Persisting State: ${error}`);
      }
    } else {
      return;
    }
  };

  const getLocalStore = (storageKey) => get(storageKey);

  return { getLocalStore, setLocalStore, resetLocalStore };
};

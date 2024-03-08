// Dev Version useLocalStorage v2.1
// By Hussein Kizz, March-01-2024

/**
 * Storage utility function that uses specified storage type and encryption settings.
 * @param {Object} options - Options for storage and encryption.
 * @param {string} [options.storageType='local'] - Type of storage (local/session).
 * @param {boolean} [options.encrypt=true] - Flag for enabling encryption, true by default.
 * @returns {Object} local storage modifying methods.
 */
export const _useStorage = (options) => {
  const { storageType = 'local' } = options || {};
  // select appropriate storage type as user defined
  let storage = storageType === 'session' ? sessionStorage : localStorage;

  // define a key to uniquely identify react-x-hands storage stuff
  let storageKey = 'default-key';

  /**
   * Time bomb function is used to clear storage after a specified time.
   * @param {string} key - The key for the state in the storage.
   * @param {number} cacheTime - Cache duration or detonation time in milliseconds.
   */
  const timeBomb = (key, cacheTime) => {
    if (typeof window) {
      setTimeout(() => {
        // storage.clear();
        set(key, '');
      }, cacheTime);
    }
  };

  /**
   * Resets the storage by clearing all existing stored data.
   */
  const resetStorage = () => {
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

  /**
   * Sets the state in the storage, optionally merging with existing state if present.
   * @param {string} key - The key for the state in the storage.
   * @param {*} newState - The new state to be stored.
   * @param {Object} options - Additional options for caching and encryption.
   * @param {boolean} [options.cacheTimeout=true] - Flag for setting cache timeout.
   * @param {number} [options.cacheTime=60000] - Cache duration in milliseconds, 60 * 1000 by default.
   * @returns {*} The persisted state.
   */
  const setState = (key, newState, options = {}) => {
    const { cacheTimeout = true, cacheTime = 60 * 1000 } = options;

    if (typeof window) {
      try {
        let stateKey = key ?? storageKey;

        // Check if state already exists in storage before writing
        const existingState = getState(stateKey);
        // const existingState = get(stateKey);

        if (existingState) {
          let mergedState = newState;
          // If exists, merge the new state with the existing one
          if (
            typeof existingState === 'object' &&
            typeof newState === 'object'
          ) {
            mergedState = { ...existingState, ...newState };
          } else if (Array.isArray(existingState) && Array.isArray(newState)) {
            mergedState = [...existingState, ...newState];
          }
          set(stateKey, mergedState);
        } else {
          // If doesn't exist, store the new state
          set(stateKey, newState);
        }

        // enable time bomb
        // console.log('timeout:', stateKey, cacheTimeout, cacheTime);
        if (cacheTimeout === true) {
          timeBomb(stateKey, cacheTime);
        }
        return getState(stateKey);
      } catch (error) {
        console.error(`Error Persisting State: ${error}`);
      }
    } else {
      return;
    }
  };

  /**
   * Retrieves the state from the storage.
   * @param {string} storageKey - The key for the state in the storage.
   * @returns {*} The retrieved state.
   */
  const getState = (storageKey) => {
    if (typeof window) {
      try {
        const retrievedState = get(storageKey);
        return retrievedState;
      } catch (error) {
        console.error(`Error retrieving local state: ${error}`);
      }
    }
  };

  /**
   * Executes provided callback function whenever a storage event occurs.
   * @param {Function} callback - The callback function to execute.
   */
  const onChange = (callback) => {
    if (typeof window) {
      window.addEventListener('storage', (event) => {
        callback(event);
      });
    }
  };

  return { getState, setState, resetStorage, onChange };
};

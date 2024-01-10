// Dev Version useLocalStorage v2
// By Hussein Kizz, Jan-5-2024

/**
 * Storage utility function that uses specified storage type and encryption settings.
 * @param {Object} options - Options for storage and encryption.
 * @param {string} [options.storageType='local'] - Type of storage (local/session).
 * @param {boolean} [options.encrypt=true] - Flag for enabling encryption, true by default.
 * @returns {Object} local storage modifying methods.
 */
export const _useStorage = ({ storageType = 'local', encrypt = true }) => {
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

  /**
   * Encrypts the given data using a simple XOR operation with the key.
   * @param {string} key - The encryption key.
   * @param {string} data - The data to be encrypted.
   * @returns {string} The encrypted data.
   */
  const simpleEncrypt = (key, data) => {
    const keyLength = key.length;
    let encryptedData = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ keyLength;
      encryptedData += String.fromCharCode(charCode);
    }

    // the hash will tell us if the data is encrypted when retrieving
    return '#' + encryptedData;
  };

  /**
   * Decrypts the given encrypted data using a simple XOR operation with the key.
   * @param {string} key - The decryption key.
   * @param {string} encryptedData - The data to be decrypted.
   * @returns {string} The decrypted data.
   */
  const simpleDecrypt = (key, encryptedData) => {
    const keyLength = key.length;
    let decryptedData = '';
    for (let i = 0; i < encryptedData.length; i++) {
      const charCode = encryptedData.charCodeAt(i) ^ keyLength;
      decryptedData += String.fromCharCode(charCode);
    }
    return decryptedData;
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
   * Sets the state to the specified key in the storage, optionally encrypting it.
   * @param {string} stateKey - The key for the state in the storage.
   * @param {*} newState - The new state to be stored.
   */
  const stateSetter = (stateKey, newState) => {
    if (encrypt) {
      let stateToPersist = simpleEncrypt(stateKey, JSON.stringify(newState));
      set(stateKey, stateToPersist);
    } else {
      set(stateKey, newState);
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
  const setState = (
    key,
    newState,
    { cacheTimeout = true, cacheTime = 60 * 1000 }
  ) => {
    if (typeof window) {
      try {
        let stateKey = key ?? storageKey;

        // Check if state already exists in storage before writing
        const existingState = getState(stateKey);
        // const existingState = get(stateKey);

        if (existingState) {
          // If exists, merge the new state with the existing one
          let mergedState = { ...existingState, ...newState };

          stateSetter(stateKey, mergedState);
        } else {
          // If doesn't exist, store the new state
          stateSetter(stateKey, newState);
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
   * Retrieves the state from the storage, decrypting it if encrypted.
   * @param {string} storageKey - The key for the state in the storage.
   * @returns {*} The retrieved state.
   */
  const getState = (storageKey) => {
    if (typeof window) {
      try {
        const probablyEncryptedState = get(storageKey);
        if (probablyEncryptedState) {
          // Check if encrypted and decrypt accordingly
          const isEncrypted =
            typeof probablyEncryptedState === 'string' &&
            probablyEncryptedState.startsWith('#');

          if (isEncrypted) {
            const decryptedState = simpleDecrypt(
              storageKey,
              probablyEncryptedState.substring(1)
            ); // Remove the '#'
            return JSON.parse(decryptedState);
          } else {
            return probablyEncryptedState; // Not encrypted, return as is
          }
        }
      } catch (error) {
        console.error(`Error retrieving local state: ${error}`);
      }
    }
    return null;
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

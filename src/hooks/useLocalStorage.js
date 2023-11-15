export const _useLocalStore = (storageType = 'local') => {
  // select appropriate storage type as user defined
  let storage = storageType === 'session' ? sessionStorage : localStorage;

  // handle auto-resetting of storage
  const timeBomb = (key, cacheTime) => {
    if (typeof window) {
      setTimeout(() => {
        // storage.clear();
        set(key, '');
      }, cacheTime);
    }
  };

  const encryptData = async (data, secretKey) => {
    const encodedData = new TextEncoder().encode(data);
    const encodedKey = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(secretKey)
    );
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: encodedKey.slice(0, 12) },
      encodedKey,
      encodedData
    );
    return encryptedData;
  };

  const decryptData = async (encryptedData, secretKey) => {
    const encodedKey = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(secretKey)
    );
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: encodedKey.slice(0, 12) },
      encodedKey,
      encryptedData
    );
    return new TextDecoder().decode(decryptedData);
  };

  const set = async (key, stateToPersist, secretKey) => {
    try {
      const encryptedState = await encryptData(
        JSON.stringify(stateToPersist),
        secretKey
      );
      storage.setItem(key, JSON.stringify(encryptedState));
    } catch (error) {
      throw new Error(`Error setting state ${key}: ${error}`);
    }
  };

  const get = async (key, secretKey) => {
    try {
      const encryptedState = JSON.parse(storage.getItem(key));
      if (encryptedState) {
        const decryptedState = await decryptData(encryptedState, secretKey);
        return JSON.parse(decryptedState);
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error retrieving state ${key}: ${error}`);
    }
  };

  const setLocalStore = async (
    key,
    currentState,
    { cacheTimeout = true, cacheTime = 60 * 1000, secretKey = '' }
  ) => {
    if (typeof window) {
      try {
        const stateKey = key || 'default-key';

        if (cacheTimeout === true) {
          timeBomb(stateKey, cacheTime);
        }

        await set(stateKey, currentState, secretKey);
        return await get(stateKey, secretKey); // Return decrypted state for usage
      } catch (error) {
        console.error(`Error persisting state: ${error}`);
      }
    } else {
      return;
    }
  };

  const getLocalStore = async (storageKey, secretKey) =>
    await get(storageKey, secretKey);

  const resetLocalStore = () => {
    if (typeof window) {
      storage.clear();
    }
  };

  return { getLocalStore, setLocalStore, resetLocalStore };
};

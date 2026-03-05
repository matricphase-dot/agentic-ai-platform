// Mock quantum crypto service – replace with actual implementation later
export const generateQuantumKey = () => {
  return {
    public_key: 'pub_' + Math.random().toString(36).substring(2),
    private_key: 'priv_' + Math.random().toString(36).substring(2)
  };
};

export const signMessage = (message: string, keyId: string) => {
  return 'sig_' + Buffer.from(message).toString('base64').substring(0, 10);
};

export const verifySignature = (message: string, signature: string, public_key: string) => {
  return true; // mock
};

export const encryptMessage = (message: string, public_key: string) => {
  return 'enc_' + Buffer.from(message).toString('base64');
};

export const decryptMessage = (encrypted: string, private_key: string) => {
  return encrypted.replace('enc_', '');
};












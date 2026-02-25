import React, { createContext, useContext, useState } from 'react';

export interface SignupData {
  firstName: string;
  surname: string;
  suffix: string;
  email: string;
  password: string;
  username: string;
  dateOfBirth: string;
  nationality: string;
  profilePic: string | null;
  acceptedTerms: boolean;
}

interface SignupContextType {
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
  resetSignupData: () => void;
}

const initialSignupData: SignupData = {
  firstName: '',
  surname: '',
  suffix: '',
  email: '',
  password: '',
  username: '',
  dateOfBirth: '',
  nationality: '',
  profilePic: null,
  acceptedTerms: false,
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [signupData, setSignupData] = useState<SignupData>(initialSignupData);

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  const resetSignupData = () => {
    setSignupData(initialSignupData);
  };

  const value: SignupContextType = {
    signupData,
    updateSignupData,
    resetSignupData,
  };

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
};

export const useSignup = (): SignupContextType => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
};
